import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('transcriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Transcriptions GET error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Transcriptions GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      creator,
      platform,
      views,
      tags,
      text,
      segments,
      language,
      duration,
      hook,
      structure,
      cta,
      notes,
    } = body;

    if (!title || !text) {
      return NextResponse.json(
        { error: 'Title and text are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('transcriptions')
      .insert({
        title,
        creator,
        platform,
        views,
        tags,
        text,
        segments,
        language,
        duration,
        hook,
        structure,
        cta,
        notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Transcriptions POST error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Transcriptions POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('transcriptions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Transcriptions DELETE error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Transcriptions DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
