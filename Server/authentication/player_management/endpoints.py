import os
from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('profile/', views.player_info, name='playerinfo'),
    path('settings/', views.get_settings, name='getsettings'),
    path('editprofile/', views.edit_profile, name='editprofile'),
    path('editavatar/', views.edit_avatar, name='editavatar'),
    path('search_usernames/', views.search_usernames, name='search_usernames'),
    path('deleteacc/', views.delete_account, name='deleteacc'),
    path('AddFriend/', views.player_friendship_post, name='AddFriend'),
    path('player_friendship_get/', views.player_friendship_get, name='player_friendship_get'),
    path('deleteplayerfriendship/', views.player_friendship_delete, name='deleteplayerfriendship'),
    path('blockfriend/', views.block_friend, name='blockfriend'),
    path('unblockfriend/', views.unblock_friend, name='unblockfriend'),
    path('match-history/', views.post_match_history, name='post_match_history'),
    path('get_user_data/', views.get_user_data, name='get_user_data'),
    path('get_match_data/', views.get_match_data, name='get_match_data'),
    path('get_top_players/', views.get_top_players, name='get_top_players'),
    path('handle_friend_request/', views.handle_friend_request, name='handle_friend_request'),
    path('public-profile/<str:username>/', views.get_public_profile, name='public_profile'),
]


urlpatterns += static(settings.MEDIA_URL , document_root=os.path.join(settings.MEDIA_ROOT, str(settings.MEDIA_URL)[1:]))


