from django.contrib import admin
from .models import Player

@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active')

# Register your models here.
