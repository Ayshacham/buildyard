from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chat_sessions", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="timerstate",
            name="stuck_notification_sent",
            field=models.BooleanField(default=False),
        ),
    ]
