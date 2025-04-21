from celery import shared_task
from django.utils.timezone import now
from django.contrib.sessions.models import Session
from django.conf import settings
from django.contrib.auth import get_user_model

@shared_task
def cleanup_expired_sessions():
    User = get_user_model()
    current_time = now()

    # Fetch all sessions that are expired
    expired_sessions = Session.objects.filter(expire_date__lt=current_time)
    print(f"Found {len(expired_sessions)} expired sessions.")
    
    for session in expired_sessions:
        print(f"Session expire date: {session.expire_date} (Current time: {now()})")
        session_data = session.get_decoded()
        user_id = session_data.get('_auth_user_id')
        
        if user_id:
            try:
                user = User.objects.get(id=user_id)
                print(f"Session expired for user: {user.username}, setting to offline")
                user.status = user.Status.OFFLINE.value
                user.save()
            except User.DoesNotExist:
                pass
    
    deleted_count, _ = expired_sessions.delete()
    return f"Deleted {deleted_count} expired sessions"