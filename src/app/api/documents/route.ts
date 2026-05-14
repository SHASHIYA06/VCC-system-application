import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllDocuments, 
  getDocumentById, 
  getDocumentsByCategory, 
  getDocumentsByCarType,
  getRelatedDrawings 
} from '@/lib/services/document.service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const category = searchParams.get('category');
  const carType = searchParams.get('carType');
  const system = searchParams.get('system');

  try {
    if (id) {
      const doc = getDocumentById(id);
      if (!doc) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      return NextResponse.json({ document: doc });
    }

    let documents = getAllDocuments();

    if (category) {
      documents = getDocumentsByCategory(category);
    }

    if (carType) {
      documents = getDocumentsByCarType(carType);
    }

    if (system) {
      const related = getRelatedDrawings(system);
      return NextResponse.json({ 
        documents, 
        relatedDocuments: related,
        count: documents.length 
      });
    }

    return NextResponse.json({ 
      documents, 
      count: documents.length,
      categories: ['PIN_DRAWING', 'LAYOUT', 'REFERENCE', 'OCR'],
      carTypes: ['DMC', 'TC', 'MC', 'CAB', 'ALL']
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}