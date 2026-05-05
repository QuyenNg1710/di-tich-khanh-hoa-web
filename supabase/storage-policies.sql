-- Chạy SQL này trên Supabase Dashboard > SQL Editor
-- Tạo buckets và policies cho Storage

-- Tạo buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true) ON CONFLICT DO NOTHING;

-- Policy: Ai cũng có thể xem (public read)
CREATE POLICY "Public read images" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Public read videos" ON storage.objects FOR SELECT USING (bucket_id = 'videos');
CREATE POLICY "Public read audio" ON storage.objects FOR SELECT USING (bucket_id = 'audio');

-- Policy: Chỉ authenticated users có thể upload
CREATE POLICY "Auth upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth upload videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');
CREATE POLICY "Auth upload audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'audio' AND auth.role() = 'authenticated');

-- Policy: Chỉ authenticated users có thể xoá
CREATE POLICY "Auth delete images" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth delete videos" ON storage.objects FOR DELETE USING (bucket_id = 'videos' AND auth.role() = 'authenticated');
CREATE POLICY "Auth delete audio" ON storage.objects FOR DELETE USING (bucket_id = 'audio' AND auth.role() = 'authenticated');
