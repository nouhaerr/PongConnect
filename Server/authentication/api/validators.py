import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class AlphanumericPasswordValidator:
    def validate(self, password, user=None):
        if not re.search(r'[A-Za-z]', password):
            raise ValidationError(
                _("The password must contain at least one letter."),
                code='password_no_letter',
            )
        if not re.search(r'\d', password):
            raise ValidationError(
                _("The password must contain at least one digit."),
                code='password_no_digit',
            )

    def get_help_text(self):
        return _("Your password must contain at least one letter and one digit.")


def validate_no_spaces(value):
    if " " in value:
        raise ValidationError("Username cannot contain spaces.")
    return value

