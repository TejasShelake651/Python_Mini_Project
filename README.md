# Python_Mini_Project - StudySphere AI Multi-Format Learning Studio

StudySphere is a full-stack web application built using **Django** and Python's scientific & NLP ecosystem. When a user uploads a document (**PDF, TXT, DOCX, CSV, Excel, or Images**), the backend automatically transforms the content into **9 interactive learning modes** accessible via a modern side navigation bar.

---

## 🌟 The 9 Learning Modes (From the Sidebar)

1. **📖 Study**: Executive overview and comprehensive topic breakdown generated with NLTK sentence scoring.
2. **📊 Visual**: Matplotlib-rendered topic and keyword weighting distribution chart.
3. **📝 Notes**: Structured bullet-point notes containing key takeaways, definitions, and critical takeaways.
4. **🗂️ Flashcards**: 3D interactive flip cards with question/term on front and explanation on back for active recall.
5. **🕸️ Map**: Concept and topic connection network rendered dynamically on HTML5 Canvas.
6. **🎧 Podcast**: Audio overview briefing with play/pause, speed controls (1x, 1.25x, 1.5x), and synchronized voice script.
7. **❓ Quiz**: 5 interactive multiple-choice & fill-in-the-blank questions with instant evaluation.
8. **🎓 Exam**: 10-question timed mock examination simulation with a 10-minute countdown timer and result certificates.
9. **📄 Source**: Raw extracted text viewer with word count, file details, and management options.

---

## 📚 Syllabus Integration Checklist

| Syllabus Unit | Topics Applied |
|---|---|
| **Unit 1: Python Basics** | String manipulation, dictionaries, lists, functions, lambda expressions, data structures |
| **Unit 2: Files in Python** | File reading (`.txt`, `.pdf`, `.docx`, `.csv`), directory storage, exception handling |
| **Unit 3: OOP & Python Libraries** | `StudyProcessor` OOP architecture, **NumPy**, **Pandas**, **Matplotlib** charting, **NLTK** tokenization & summarization, Regular Expressions (`re`) |
| **Unit 4: Advanced Python** | **Django** web framework, routing, MVC/MVT architecture, local server, **SQLite database connectivity** |

---

## 🚀 How to Run Locally

1. **Activate / Open Terminal in this folder:**
   ```powershell
   cd c:\Users\Tejas\Downloads\pythonProject
   ```

2. **Run Migrations (Already configured):**
   ```powershell
   python manage.py migrate
   ```

3. **Start the Django Development Server:**
   ```powershell
   python manage.py runserver
   ```

4. **Open in Browser:**
   Navigate to [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## 💡 Knowledge Ingestion
Upload any study document, PDF, DOCX, TXT, CSV, Excel, or lecture notes directly into StudySphere to immediately synthesize and launch all 9 interactive learning modes with real-time AI processing.
