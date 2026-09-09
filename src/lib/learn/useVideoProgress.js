import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const todayStr = () => new Date().toISOString().slice(0, 10);

// Returns a map of video_id -> progress record for all videos the user has watched.
export function useAllVideoProgress() {
  const { data: records = [] } = useQuery({
    queryKey: ['video-progress'],
    queryFn: () => base44.entities.VideoProgress.list('-updated_date', 200),
  });
  const map = {};
  records.forEach((r) => { map[r.video_id] = r; });
  return map;
}

// Per-video progress: load the record (if any) and expose a save helper that
// upserts position / duration / completed state.
export function useVideoProgress(videoId) {
  const qc = useQueryClient();
  const all = useAllVideoProgress();
  const record = all[videoId];

  const save = useMutation({
    mutationFn: async ({ position, duration, completed, title, topic }) => {
      const payload = {
        position: Math.floor(position || 0),
        duration: duration || record?.duration || 0,
        completed: completed ?? record?.completed ?? false,
        last_watched: todayStr(),
        title: title || record?.title || '',
        topic: topic || record?.topic || '',
      };
      if (record) {
        return base44.entities.VideoProgress.update(record.id, payload);
      }
      return base44.entities.VideoProgress.create({ video_id: videoId, ...payload });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['video-progress'] }),
  });

  return { record, save };
}