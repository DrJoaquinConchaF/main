"""Reproduce the user-supplied table; do not label it manufacturer-verified."""
import json
from pathlib import Path
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
pdfmetrics.registerFont(TTFont("ReferenceSans", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
root=Path(__file__).resolve().parent.parent
reference=json.loads((root/'src/treatments/wegovy-reference.json').read_text())
styles=getSampleStyleSheet()
for style in styles.byName.values(): style.fontName="ReferenceSans"
items=[Paragraph('JC · Tabla de referencia de clics de Wegovy',styles['Title']),Spacer(1,10),Paragraph(reference['provenance'],styles['Normal']),Spacer(1,12)]
rows=[['Pluma de la imagen','Clics','Dosis (mg)']]+[[str(v) for v in row] for row in reference['literalRows']]
table=Table(rows,colWidths=[260,75,85],repeatRows=1)
table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#8e183f')),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),.5,colors.HexColor('#dec5ce')),('FONTNAME',(0,0),(-1,-1),'ReferenceSans'),('FONTSIZE',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),7)]))
items += [table,Spacer(1,14),Paragraph('Cálculo adicional de la app',styles['Heading2']),Paragraph('Clics teóricos = dosis indicada × clics de una dosis completa / mg de una dosis completa. Redondeo al entero más cercano (mitades hacia arriba). Ejemplo: pluma multidosis 2,4 mg, 3 mL, 75 clics/dosis; 1,2 mg → 37,5 clics teóricos → 38 clics (aproximadamente 1,216 mg). Este ejemplo se calcula; no es una fila literal de la imagen.',styles['Normal']),Spacer(1,10),Paragraph('La imagen contiene valores aproximados; algunas filas no coinciden exactamente con el cálculo proporcional. La app conserva las filas expresamente revisadas por el profesional como prioridad. No aplicar a plumas monodosis, otra concentración o presentación. No se ha incluido una calibración para 0,25 mg. El conteo de clics no sustituye las instrucciones del fabricante; verificar el dispositivo antes de indicar.',styles['Normal'])]
SimpleDocTemplate(str(root/'reference-assets/wegovy-tabla-clics.pdf'),pagesize=A4,rightMargin=42,leftMargin=42,topMargin=35,bottomMargin=35).build(items)
