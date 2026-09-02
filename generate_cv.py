import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER

def build_pdf():
    output_path = os.path.join(os.getcwd(), "public", "cv.pdf")
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=45,
        rightMargin=45,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Clean, strict monochrome typography — No artificial AI colors or fluff
    name_style = ParagraphStyle(
        'CVName',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#111111'),
        alignment=TA_CENTER
    )

    title_style = ParagraphStyle(
        'CVTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#333333'),
        alignment=TA_CENTER
    )

    contact_style = ParagraphStyle(
        'CVContact',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#444444'),
        alignment=TA_CENTER
    )

    heading_style = ParagraphStyle(
        'CVHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor('#111111'),
        spaceBefore=10,
        spaceAfter=3,
        textTransform='uppercase'
    )

    body_style = ParagraphStyle(
        'CVBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#222222'),
        alignment=TA_LEFT
    )

    bullet_style = ParagraphStyle(
        'CVBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#222222'),
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=2
    )

    item_title_style = ParagraphStyle(
        'CVItemTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#111111')
    )

    item_meta_style = ParagraphStyle(
        'CVItemMeta',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#444444')
    )

    elements = []

    # 1. HEADER
    elements.append(Paragraph("SYAMIL CHOLID ATSANI", name_style))
    elements.append(Spacer(1, 2))
    elements.append(Paragraph("Full-Stack Developer", title_style))
    elements.append(Spacer(1, 3))
    
    contact_text = (
        "Lampung, Indonesia &nbsp;|&nbsp; "
        "syamilcholidatsan@gmail.com &nbsp;|&nbsp; "
        "linkedin.com/in/syamilca &nbsp;|&nbsp; "
        "github.com/MilQ28"
    )
    elements.append(Paragraph(contact_text, contact_style))
    elements.append(Spacer(1, 6))
    elements.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor('#111111'), spaceBefore=0, spaceAfter=8))

    # 2. SUMMARY / PROFILE
    elements.append(Paragraph("SUMMARY", heading_style))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#888888'), spaceBefore=0, spaceAfter=4))
    profile_p = (
        "Full-stack web developer and 2024 Software Engineering graduate from SMK Telkom Lampung. "
        "Focuses on developing web applications using Next.js, React, and Laravel. "
        "Currently building Stellazone, a web platform for MPK-OSIS student organizations."
    )
    elements.append(Paragraph(profile_p, body_style))
    elements.append(Spacer(1, 4))

    # 3. EDUCATION
    elements.append(Paragraph("EDUCATION", heading_style))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#888888'), spaceBefore=0, spaceAfter=4))
    
    edu_table_data = [
        [
            Paragraph("<b>SMK Telkom Lampung</b> &mdash; Lampung, Indonesia", item_title_style),
            Paragraph("2024", ParagraphStyle('RightMeta', parent=item_meta_style, alignment=2))
        ]
    ]
    edu_table = Table(edu_table_data, colWidths=['75%', '25%'])
    edu_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    elements.append(edu_table)
    elements.append(Paragraph("Rekayasa Perangkat Lunak (Software Engineering)", body_style))
    elements.append(Spacer(1, 4))

    # 4. PROJECTS
    elements.append(Paragraph("PROJECTS", heading_style))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#888888'), spaceBefore=0, spaceAfter=4))
    
    proj_header_data = [
        [
            Paragraph("<b>Stellazone</b> &ndash; School Organization Web Platform", item_title_style),
            Paragraph("In Progress", ParagraphStyle('RightMetaProj', parent=item_meta_style, alignment=2))
        ]
    ]
    proj_table = Table(proj_header_data, colWidths=['75%', '25%'])
    proj_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    elements.append(proj_table)
    elements.append(Paragraph("Full-Stack Developer | Next.js, Laravel", item_meta_style))
    elements.append(Spacer(1, 2))
    
    bullets = [
        "Developing a web platform for MPK-OSIS to manage school organization activities and records.",
        "Building frontend UI and application views with Next.js, React, and Tailwind CSS.",
        "Creating backend REST API endpoints and MySQL database schemas in Laravel (PHP).",
        "Integrating frontend interfaces with backend API services for user auth and data handling."
    ]
    for b in bullets:
        elements.append(Paragraph(f"&bull;&nbsp;&nbsp;{b}", bullet_style))
    
    elements.append(Spacer(1, 4))

    # 5. TECHNICAL SKILLS
    elements.append(Paragraph("TECHNICAL SKILLS", heading_style))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#888888'), spaceBefore=0, spaceAfter=4))
    
    skills = [
        ("Languages", "PHP, TypeScript, JavaScript, HTML, CSS"),
        ("Frameworks & Libraries", "Next.js, React, Laravel, Tailwind CSS"),
        ("Databases", "PostgreSQL, MySQL"),
        ("Tools", "Git, GitHub")
    ]
    
    for cat, items in skills:
        elements.append(Paragraph(f"&bull;&nbsp;&nbsp;<b>{cat}:</b> {items}", bullet_style))

    elements.append(Spacer(1, 4))

    # 6. LANGUAGES
    elements.append(Paragraph("LANGUAGES", heading_style))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#888888'), spaceBefore=0, spaceAfter=4))
    
    elements.append(Paragraph("&bull;&nbsp;&nbsp;<b>Indonesian:</b> Native", bullet_style))
    elements.append(Paragraph("&bull;&nbsp;&nbsp;<b>English:</b> Working proficiency", bullet_style))

    doc.build(elements)
    print(f"Generated clean CV at: {output_path}")

if __name__ == "__main__":
    build_pdf()
