import { query } from '@/lib/db';

export default async function CommentsPage() {
  const comments = await query('SELECT * FROM comments ORDER BY created_at DESC LIMIT 50').catch(() => []);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Comments</h1>
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet. Database not connected.</p>
        ) : (
          comments.map((c: any) => (
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