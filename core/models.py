from django.db import models

class Document(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/', blank=True, null=True)
    file_type = models.CharField(max_length=50, default='text')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    # Processed NLP & Data outputs
    raw_text = models.TextField(blank=True)
    study_summary = models.TextField(blank=True)
    notes_data = models.JSONField(default=list, blank=True)
    flashcards_data = models.JSONField(default=list, blank=True)
    map_data = models.JSONField(default=dict, blank=True)
    diagrams_data = models.JSONField(default=dict, blank=True)
    visual_chart_url = models.CharField(max_length=255, blank=True)
    podcast_script = models.TextField(blank=True)
    podcast_audio_url = models.CharField(max_length=255, blank=True)
    quiz_data = models.JSONField(default=list, blank=True)
    exam_data = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.title} ({self.uploaded_at.strftime('%Y-%m-%d %H:%M')})"

class QuizSubmission(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='submissions')
    mode = models.CharField(max_length=20, default='quiz')  # 'quiz' or 'exam'
    score = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def percentage(self):
        if self.total_questions > 0:
            return round((self.score / self.total_questions) * 100, 1)
        return 0.0

    def __str__(self):
        return f"{self.mode.capitalize()} - {self.score}/{self.total_questions} ({self.document.title})"
