from django.db import migrations, models
import django.db.models.deletion


def copy_phone_email_forward(apps, schema_editor):
    Property = apps.get_model('properties', 'Property')
    PropertyPhone = apps.get_model('properties', 'PropertyPhone')
    PropertyEmail = apps.get_model('properties', 'PropertyEmail')

    for prop in Property.objects.all():
        if prop.phone:
            PropertyPhone.objects.create(property=prop, phone=prop.phone, is_primary=True)
        if prop.email:
            PropertyEmail.objects.create(property=prop, email=prop.email, is_primary=True)


def copy_phone_email_backward(apps, schema_editor):
    Property = apps.get_model('properties', 'Property')
    for prop in Property.objects.all():
        phone = prop.phones.filter(is_primary=True).first() or prop.phones.first()
        email = prop.emails.filter(is_primary=True).first() or prop.emails.first()
        prop.phone = phone.phone if phone else ''
        prop.email = email.email if email else ''
        prop.save(update_fields=['phone', 'email'])


class Migration(migrations.Migration):

    dependencies = [
        ('properties', '0003_property_city_fk'),
    ]

    operations = [
        migrations.CreateModel(
            name='PropertyPhone',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('phone', models.CharField(max_length=20)),
                ('label', models.CharField(blank=True, help_text='e.g., Reception, Manager', max_length=100)),
                ('is_primary', models.BooleanField(default=False)),
                ('order', models.PositiveIntegerField(default=0)),
                ('property', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='phones', to='properties.property')),
            ],
            options={
                'verbose_name': 'Property Phone',
                'verbose_name_plural': 'Property Phones',
                'ordering': ['-is_primary', 'order'],
            },
        ),
        migrations.CreateModel(
            name='PropertyEmail',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254)),
                ('label', models.CharField(blank=True, help_text='e.g., Reservations, Support', max_length=100)),
                ('is_primary', models.BooleanField(default=False)),
                ('order', models.PositiveIntegerField(default=0)),
                ('property', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='emails', to='properties.property')),
            ],
            options={
                'verbose_name': 'Property Email',
                'verbose_name_plural': 'Property Emails',
                'ordering': ['-is_primary', 'order'],
            },
        ),
        migrations.RunPython(copy_phone_email_forward, copy_phone_email_backward),
        migrations.RemoveField(
            model_name='property',
            name='phone',
        ),
        migrations.RemoveField(
            model_name='property',
            name='email',
        ),
    ]
