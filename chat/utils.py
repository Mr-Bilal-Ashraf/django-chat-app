import pytz


def convert_to_timezone(date, timezone):
    timezone = pytz.timezone(timezone)
    return date.astimezone(timezone)
