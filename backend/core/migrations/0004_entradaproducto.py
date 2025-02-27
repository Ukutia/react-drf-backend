# Generated by Django 5.1.3 on 2025-02-27 19:45

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_alter_factura_total'),
    ]

    operations = [
        migrations.CreateModel(
            name='EntradaProducto',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cantidad_kilos', models.DecimalField(decimal_places=2, max_digits=10)),
                ('costo_por_kilo', models.DecimalField(decimal_places=2, max_digits=10)),
                ('fecha_entrada', models.DateTimeField(auto_now_add=True)),
                ('producto', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.producto')),
            ],
        ),
    ]
