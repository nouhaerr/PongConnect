import logging
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.contrib.sessions.models import Session
from django.dispatch import receiver
from django.utils.timezone import now, localtime
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save, post_delete

User = get_user_model()
logger = logging.getLogger(__name__)

@receiver(user_logged_in)
def set_user_online(sender, request, user, **kwargs):
    logger.info(localtime(now()))
    user.status = user.Status.ONLINE.value
    user.save()
    # logger.info(f"✅ User {user.username} is now online.")


@receiver(user_logged_out)
def set_user_offline(sender, request, user, **kwargs):
    if user:
        user.status = user.Status.OFFLINE.value
        user.save()
        # logger.info(f"❌ User {user.username} is now offline.")


@receiver(post_delete, sender=Session)
def set_user_offline_on_session_delete(sender, instance, **kwargs):
    # logger.info(f"time: {localtime(now())}")
    try:
        session_data = instance.get_decoded()
        user_id = session_data.get('_auth_user_id')

        
        if user_id:
            user = User.objects.filter(pk=user_id).first()
            user_active_sessions = Session.objects.filter(expire_date__gt=now(), session_key__isnull=False).filter(session_data__contains=user_id).exists()
            if user and not user_active_sessions:
                # logger.info(f"expire_date: {instance.expire_date}")
                user.status = user.Status.OFFLINE.value
                user.save()
                # logger.info(f"⚠️ User {user.username} set to offline due to session deletion.")
    except Exception as e:
        logger.info(f"🚨 Error in session cleanup: {e}")
