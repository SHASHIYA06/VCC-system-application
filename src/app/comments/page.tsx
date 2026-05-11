import { query, execute } from '@/lib/db';
import { redirect } from 'next/navigation';

interface Comment {
  id: number;
  comment: string;
  created_at: string;
}

async function create(formData: FormData) {
  'use server';
  const comment = formData.get('comment') as string;
  if (comment?.trim()) {
    await execute('INSERT INTO comments (comment) VALUES ($1)', [comment]);
  }
  redirect('/comments');
}

async function getComments(): Promise<Comment[]> {
  'use server';
  try {
    const result = await query<Comment>('SELECT * FROM comments ORDER BY created_at DESC');
    return result;
  } catch {
    return [];
  }
}

export default async function CommentsPage() {
  const comments = await getComments();

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Comments</h1>
      
      <form action={create} className="flex gap-3 mb-8">
        <input
          type="text"
          name="comment"
          placeholder="Write a comment..."
          className="flex-1 px-4 py-2 border rounded-lg"
          required
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Submit
        </button>
      </form>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="p-4 bg-gray-50 rounded-lg">
              <p>{c.comment}</p>
              <p className="text-sm text-gray-400 mt-2">
                {new Date(c.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}