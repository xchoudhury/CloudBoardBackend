# Generated by Django 2.0.1 on 2018-04-12 16:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cloudboard', '0007_snippet_file'),
    ]

    operations = [
        migrations.AddField(
            model_name='snippet',
            name='raw_bin',
            field=models.BinaryField(null=True),
        ),
    ]