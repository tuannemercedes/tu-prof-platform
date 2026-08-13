-- Capa (thumbnail) opcional por material, exibida nos cards de tamanho
-- fixo do aluno. Bucket público — são só imagens decorativas, sem dado
-- sensível, então dispensa signed URL.
alter table public.materiais
  add column capa_path text;

insert into storage.buckets (id, name, public)
values ('capas', 'capas', true)
on conflict (id) do nothing;

create policy "capas bucket: admin manage" on storage.objects
  for all using (bucket_id = 'capas' and public.is_admin())
  with check (bucket_id = 'capas' and public.is_admin());

create policy "capas bucket: leitura publica" on storage.objects
  for select using (bucket_id = 'capas');
