from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("ai_assistant", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="standup",
            name="where_you_are",
            field=models.JSONField(default=list),
        ),
    ]
