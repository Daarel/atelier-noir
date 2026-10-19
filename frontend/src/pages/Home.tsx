import ArchivePreview from '@/components/home/ArchivePreview';
import Collection from '@/components/home/Collection';
import Hero from '@/components/home/Hero';
import Newsletter from '@/components/home/Newsletter';

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Collection />
      <ArchivePreview />
      <Newsletter />
    </div>
  );
}
