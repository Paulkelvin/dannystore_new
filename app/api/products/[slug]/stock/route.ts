import { NextResponse } from 'next/server';
import { sanityClientWrite } from '@/lib/sanityClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = params;
    const { quantity, type, reason, variantId } = await request.json();

    if (!quantity || !type || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the current product or variant
    const query = variantId
      ? `*[_type == "product" && slug.current == $slug][0].variants[_key == $variantId][0]`
      : `*[_type == "product" && slug.current == $slug][0]`;

    const currentDoc = await sanityClientWrite.fetch(query, { slug, variantId });

    if (!currentDoc) {
      return NextResponse.json(
        { error: 'Product or variant not found' },
        { status: 404 }
      );
    }

    // Calculate new stock
    let newStock = currentDoc.stock;
    switch (type) {
      case 'added':
        newStock += quantity;
        break;
      case 'reduced':
      case 'reserved':
        newStock -= quantity;
        break;
      case 'released':
        newStock += quantity;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid stock update type' },
          { status: 400 }
        );
    }

    if (newStock < 0) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Determine stock status
    const lowStockThreshold = currentDoc.lowStockThreshold || 5;
    let stockStatus = 'in_stock';
    if (newStock === 0) {
      stockStatus = 'out_of_stock';
    } else if (newStock <= lowStockThreshold) {
      stockStatus = 'low_stock';
    }

    // Create stock history entry
    const stockHistoryEntry = {
      _type: 'object',
      date: new Date().toISOString(),
      quantity,
      type,
      reason,
    };

    // Update the document
    const updateQuery = variantId
      ? `*[_type == "product" && slug.current == $slug][0].variants[_key == $variantId]`
      : `*[_type == "product" && slug.current == $slug]`;

    const update = {
      stock: newStock,
      stockStatus,
      stockHistory: [
        ...(currentDoc.stockHistory || []),
        stockHistoryEntry,
      ],
    };

    await sanityClientWrite
      .patch(updateQuery)
      .set(update)
      .commit();

    return NextResponse.json({
      success: true,
      newStock,
      stockStatus,
    });
  } catch (error) {
    console.error('Stock update error:', error);
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    );
  }
}

// Get stock status
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get('variantId');

    const query = variantId
      ? `*[_type == "product" && slug.current == $slug][0].variants[_key == $variantId][0]`
      : `*[_type == "product" && slug.current == $slug][0]`;

    const doc = await sanityClientWrite.fetch(query, { slug, variantId });

    if (!doc) {
      return NextResponse.json(
        { error: 'Product or variant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      stock: doc.stock,
      stockStatus: doc.stockStatus,
      lowStockThreshold: doc.lowStockThreshold,
      stockHistory: doc.stockHistory || [],
    });
  } catch (error) {
    console.error('Stock status error:', error);
    return NextResponse.json(
      { error: 'Failed to get stock status' },
      { status: 500 }
    );
  }
} 