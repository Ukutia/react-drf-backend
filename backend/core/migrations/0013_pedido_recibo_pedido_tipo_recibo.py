# Generated by Django 5.1.3 on 2025-03-05 22:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0012_alter_detallepedido_cantidad_kilos_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='pedido',
            name='recibo',
            field=models.ImageField(blank=True, null=True, upload_to='recibo_pedidos/', verbose_name='Recibo (Foto)'),
        ),
        migrations.AddField(
            model_name='pedido',
            name='tipo_recibo',
            field=models.CharField(choices=[('Boleta', 'Boleta'), ('Factura', 'Factura')], default='Boleta', max_length=10, verbose_name='Tipo de Recibo'),
        ),
    ]
