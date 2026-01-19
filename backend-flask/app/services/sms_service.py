from app.config.config import get_config

config = get_config()


class SmsService:
    """Service for sending SMS messages.

    This is intentionally provider-agnostic, but currently supports Twilio if
    credentials are configured via env vars.
    """

    @staticmethod
    def _is_twilio_configured() -> bool:
        return bool(
            getattr(config, 'TWILIO_ACCOUNT_SID', None)
            and getattr(config, 'TWILIO_AUTH_TOKEN', None)
            and getattr(config, 'TWILIO_FROM_NUMBER', None)
        )

    @staticmethod
    def send_sms(to_number: str, message: str):
        """Send an SMS message.

        If Twilio isn't installed or not configured, raises an Exception.
        """
        if not SmsService._is_twilio_configured():
            raise Exception('SMS is not configured (missing Twilio env vars)')

        try:
            from twilio.rest import Client  # type: ignore
        except Exception:
            raise Exception('Twilio package is not installed. Install `twilio` to enable SMS.')

        try:
            client = Client(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN)
            msg = client.messages.create(
                body=message,
                from_=config.TWILIO_FROM_NUMBER,
                to=to_number,
            )
            return {'status': 'success', 'sid': getattr(msg, 'sid', None)}
        except Exception as e:
            raise Exception(f'Error sending SMS: {str(e)}')

    @staticmethod
    def send_phone_change_code(to_phone: str, code: str, new_phone: str = None):
        """Send a phone change verification code to a phone number via SMS."""
        # Keep the message short to avoid SMS truncation.
        if new_phone:
            message = f"{config.APP_NAME}: code {code} to confirm phone change to {new_phone}. Expires in 10 min."
        else:
            message = f"{config.APP_NAME}: your verification code is {code}. Expires in 10 min."
        return SmsService.send_sms(to_phone, message)


sms_service = SmsService()
