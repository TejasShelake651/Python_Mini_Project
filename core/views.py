import json
import re
import os
import uuid
from pathlib import Path
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.contrib import messages
from .models import Document, QuizSubmission
from .processor import StudyProcessor

processor = StudyProcessor()

def landing(request):
    """World-class landing page for StudySphere."""
    if request.GET.get('doc') or request.GET.get('tab') or request.GET.get('app'):
        qs = request.META.get('QUERY_STRING', '')
        return redirect(f'/studio/?{qs}' if qs else '/studio/')

    total_docs = Document.objects.count()

    return render(request, 'core/landing.html', {
        'total_docs': total_docs,
    })

def index(request):
    """Main StudySphere interface displaying the 9 learning views."""
    doc_id = request.GET.get('doc')
    active_doc = None

    if doc_id:
        active_doc = Document.objects.filter(id=doc_id).first()
    
    if not active_doc:
        active_doc = Document.objects.order_by('-uploaded_at').first()

    all_docs = Document.objects.order_by('-uploaded_at')[:10]
    
    chart_data = None
    if active_doc:
        if not active_doc.diagrams_data or 'flowchart_steps' not in active_doc.diagrams_data:
            active_doc.diagrams_data = processor.generate_diagrams(active_doc.raw_text)
            active_doc.save(update_fields=['diagrams_data'])

        if not active_doc.map_data or not any('definition' in n for n in active_doc.map_data.get('nodes', [])):
            active_doc.map_data = processor.generate_concept_map_data(active_doc.raw_text)
            active_doc.save(update_fields=['map_data'])

        chart_data = processor.get_interactive_chart_data(active_doc.raw_text, active_doc.title)

    submissions = []
    if active_doc:
        submissions = active_doc.submissions.order_by('-submitted_at')[:5]

    return render(request, 'core/index.html', {
        'doc': active_doc,
        'all_docs': all_docs,
        'submissions': submissions,
        'chart_data': chart_data,
        'chart_data_json': json.dumps(chart_data) if chart_data else '{}',
        'diagrams_data_json': json.dumps(active_doc.diagrams_data) if active_doc and active_doc.diagrams_data else '{}',
        'map_data_json': json.dumps(active_doc.map_data) if active_doc and active_doc.map_data else '{}',
        'flashcards_data_json': json.dumps(active_doc.flashcards_data) if active_doc and active_doc.flashcards_data else '[]',
    })

@csrf_exempt
def upload_document(request):
    """Handle document upload and initiate full analysis pipeline with strict validation."""
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        uploaded_file = request.FILES.get('file')
        raw_text_input = request.POST.get('raw_text', '').strip()

        if not uploaded_file and not raw_text_input:
            messages.error(request, "Please choose a file or paste text before submitting.")
            return redirect('studio')

        # Determine file type
        file_ext = 'txt'
        if uploaded_file:
            file_ext = Path(uploaded_file.name).suffix.lower().strip('.')

        # Extract & validate text FIRST
        try:
            if uploaded_file:
                # Save temporarily to run OCR and extract text
                temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
                os.makedirs(temp_dir, exist_ok=True)
                temp_filename = f"upload_{uuid.uuid4().hex}_{uploaded_file.name}"
                temp_path = os.path.join(temp_dir, temp_filename)

                with open(temp_path, 'wb+') as destination:
                    for chunk in uploaded_file.chunks():
                        destination.write(chunk)

                try:
                    extracted_text = processor.extract_text(temp_path, file_ext)
                finally:
                    if os.path.exists(temp_path):
                        try:
                            os.remove(temp_path)
                        except Exception:
                            pass
            else:
                extracted_text = raw_text_input.strip()
                if len(re.findall(r'[a-zA-Z0-9]', extracted_text)) < 5:
                    raise ValueError("The pasted notes are empty or too short. Please provide meaningful study text.")

        except ValueError as val_err:
            error_msg = str(val_err)
            if "IMAGE_EMPTY_OR_INVALID" in error_msg:
                user_msg = "The uploaded image is empty, blank, or contains no readable text. Please upload an image with clear, legible text or notes."
            elif "DOCUMENT_EMPTY" in error_msg:
                user_msg = "The uploaded file contains no readable text or is empty. Please upload a document with study content."
            else:
                user_msg = error_msg

            if request.headers.get('x-requested-with') == 'XMLHttpRequest' or 'application/json' in request.headers.get('accept', ''):
                return JsonResponse({'status': 'error', 'message': user_msg}, status=400)
            
            messages.error(request, user_msg)
            return redirect('studio')

        except Exception as ex:
            user_msg = f"Unable to process file: {str(ex)}"
            if request.headers.get('x-requested-with') == 'XMLHttpRequest' or 'application/json' in request.headers.get('accept', ''):
                return JsonResponse({'status': 'error', 'message': user_msg}, status=400)
            messages.error(request, user_msg)
            return redirect('studio')

        # If valid, create the Document
        if not title:
            if uploaded_file:
                title = Path(uploaded_file.name).stem.replace('_', ' ').replace('-', ' ').title()
            else:
                title = "Study Notes (" + extracted_text[:30] + "...)"

        doc = Document.objects.create(
            title=title,
            file=uploaded_file,
            file_type=file_ext,
            raw_text=extracted_text,
        )

        # Generate all 9 learning representations dynamically from uploaded text
        doc.study_summary = processor.generate_study_summary(extracted_text)
        doc.notes_data = processor.generate_notes(extracted_text)
        doc.flashcards_data = processor.generate_flashcards(extracted_text)
        doc.map_data = processor.generate_concept_map_data(extracted_text)
        doc.diagrams_data = processor.generate_diagrams(extracted_text)
        doc.podcast_script = processor.generate_podcast_script(extracted_text, doc.title)
        
        # Media synthesis (visual chart and podcast audio)
        doc.visual_chart_url = processor.generate_visual_chart(extracted_text, doc.id, settings.MEDIA_ROOT)
        doc.podcast_audio_url = processor.generate_podcast_audio(doc.podcast_script, doc.id, settings.MEDIA_ROOT)
        
        # Adaptive Quiz and Timed Exam
        doc.quiz_data = processor.generate_quiz_questions(extracted_text, count=5)
        doc.exam_data = processor.generate_exam_questions(extracted_text)

        doc.save()
        messages.success(request, f"Successfully synthesized '{doc.title}' into 9 study modalities!")
        return redirect(f'/studio/?doc={doc.id}')

    return redirect('studio')

def load_sample(request):
    """Redirect to studio without pre-populating mock sample data."""
    return redirect('studio')

@csrf_exempt
def submit_quiz(request, doc_id):
    """Handle interactive quiz or exam evaluation via AJAX."""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            mode = data.get('mode', 'quiz')  # 'quiz' or 'exam'
            answers = data.get('answers', {})

            doc = get_object_or_404(Document, id=doc_id)
            questions = doc.quiz_data if mode == 'quiz' else doc.exam_data

            score = 0
            results = []

            for q in questions:
                q_id = str(q.get('id'))
                user_ans = answers.get(q_id, '').strip().lower()
                correct_ans = str(q.get('correct_answer', '')).strip().lower()
                is_correct = (user_ans == correct_ans) and (len(user_ans) > 0)
                
                if is_correct:
                    score += 1

                results.append({
                    'id': q.get('id'),
                    'question': q.get('question'),
                    'user_answer': answers.get(q_id, 'Not Answered'),
                    'correct_answer': q.get('correct_answer'),
                    'is_correct': is_correct,
                    'explanation': q.get('explanation')
                })

            total = len(questions)
            percentage = round((score / total) * 100, 1) if total > 0 else 0

            # Save attempt
            QuizSubmission.objects.create(
                document=doc,
                mode=mode,
                score=score,
                total_questions=total
            )

            return JsonResponse({
                'status': 'success',
                'score': score,
                'total': total,
                'percentage': percentage,
                'results': results
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

def delete_document(request, doc_id):
    """Delete document and its media assets."""
    doc = get_object_or_404(Document, id=doc_id)
    doc.delete()
    return redirect('studio')

def export_study_sheet(request, doc_id):
    """Clean, high-density printable revision sheet for exam day."""
    doc = get_object_or_404(Document, id=doc_id)
    return render(request, 'core/export_sheet.html', {'doc': doc})

@csrf_exempt
def viva_copilot(request, doc_id):
    """Interactive Oral Viva Examiner and Live Knowledge Copilot API."""
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'POST required'}, status=405)

    try:
        data = json.loads(request.body)
        action = data.get('action', 'ask_copilot')
        doc = get_object_or_404(Document, id=doc_id)

        if action == 'get_viva_question':
            keywords = processor.get_keywords(doc.raw_text, 10)
            definitions = doc.notes_data.get('definitions', [])
            
            import random
            if definitions and random.random() > 0.4:
                selected_def = random.choice(definitions)
                question = f"In your own words, how would you define and explain the practical importance of: '{selected_def[:80]}...'?"
                key_terms = [w.lower() for w, _ in keywords[:6]]
            else:
                kw = random.choice(keywords)[0].capitalize() if keywords else "Core Subject Principles"
                question = f"Suppose the external examiner asks you: 'What is {kw}, and how is it practically applied in this material?'"
                key_terms = [kw.lower()]

            return JsonResponse({
                'status': 'success',
                'question': question,
                'key_terms': key_terms
            })

        elif action == 'evaluate_viva_answer':
            user_answer = data.get('answer', '').strip()
            key_terms = data.get('key_terms', [])

            if not user_answer:
                return JsonResponse({
                    'status': 'success',
                    'score': 0.0,
                    'feedback': 'Please speak or type your answer before asking the examiner to grade it.',
                    'status_badge': 'Awaiting Answer',
                    'word_count': 0
                })

            words = set(re.findall(r'\b\w+\b', user_answer.lower()))
            matches = [t for t in key_terms if t in words or any(t in w for w in words)]
            
            word_count = len(user_answer.split())
            if word_count > 15 and len(matches) >= 1:
                score = round(min(10.0, 7.5 + (len(matches) * 0.8) + (min(word_count, 40) * 0.05)), 1)
                feedback = f"Excellent articulation! You hit {len(matches)} core technical concept(s). That demonstrates high confidence for your viva exam."
                status_badge = "Distinction"
            elif word_count >= 8:
                score = 6.5
                feedback = "Fair response, but brief. In an oral exam, expand on the definition by giving an architectural example."
                status_badge = "Good Attempt"
            else:
                score = 4.0
                feedback = "Too brief. An oral examiner will ask you to elaborate further with underlying principles."
                status_badge = "Needs Detail"

            return JsonResponse({
                'status': 'success',
                'score': score,
                'feedback': feedback,
                'status_badge': status_badge,
                'word_count': word_count
            })

        elif action == 'exam_traps':
            keywords = [k[0].capitalize() for k in processor.get_keywords(doc.raw_text, 6)]
            kw1 = keywords[0] if keywords else "Core Principles"
            kw2 = keywords[1] if len(keywords) > 1 else "Structural Hierarchy"

            traps = [
                f"⚠️ Trap 1: Confusing definitions and core assumptions regarding {kw1}.",
                f"⚠️ Trap 2: Overlooking boundary conditions and dependencies involving {kw2}.",
                "⚠️ Trap 3: Not verifying intermediate assertions against foundational principles."
            ]
            return JsonResponse({
                'status': 'success',
                'traps': traps
            })

        else:  # 'ask_copilot'
            user_query = data.get('query', '').strip()
            if not user_query:
                return JsonResponse({'status': 'error', 'message': 'Empty query'}, status=400)

            sentences = [s.strip() for s in doc.raw_text.split('.') if len(s.strip()) > 20]
            query_words = set(user_query.lower().split())

            best_match = ""
            best_score = 0
            for s in sentences:
                s_words = set(s.lower().split())
                overlap = len(query_words.intersection(s_words))
                if overlap > best_score:
                    best_score = overlap
                    best_match = s

            if best_match and best_score > 0:
                answer = f"Based on your notes: {best_match.strip()}."
            else:
                answer = f"According to your document, this relates directly to {doc.title}. Key principles emphasize modular structure, clear definitions, and robust conceptual understanding."

            return JsonResponse({
                'status': 'success',
                'answer': answer
            })

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
