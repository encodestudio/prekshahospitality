from django.db import migrations, models
import django.db.models.deletion


def create_cities_and_link(apps, schema_editor):
    City = apps.get_model('properties', 'City')
    Property = apps.get_model('properties', 'Property')

    city_map = {}
    for prop in Property.objects.all():
        name = prop.city_name
        if name and name not in city_map:
            city, _ = City.objects.get_or_create(name=name, defaults={'is_active': True})
            city_map[name] = city

    for prop in Property.objects.all():
        if prop.city_name in city_map:
            prop.city = city_map[prop.city_name]
            prop.save(update_fields=['city'])


def reverse_cities_link(apps, schema_editor):
    Property = apps.get_model('properties', 'Property')
    for prop in Property.objects.select_related('city').all():
        if prop.city:
            prop.city_name = prop.city.name
            prop.save(update_fields=['city_name'])


class Migration(migrations.Migration):

    dependencies = [
        ('properties', '0002_city_cityphoto_placetovisit'),
    ]

    operations = [
        migrations.RenameField(
            model_name='property',
            old_name='city',
            new_name='city_name',
        ),
        migrations.AddField(
            model_name='property',
            name='city',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='properties',
                to='properties.city',
            ),
        ),
        migrations.RunPython(create_cities_and_link, reverse_cities_link),
        migrations.RemoveField(
            model_name='property',
            name='city_name',
        ),
    ]
