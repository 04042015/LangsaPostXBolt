import React from 'react';
import { Users, Target, Award, Heart } from 'lucide-react';

const AboutPage: React.FC = () => {
  const teamMembers = [
    {
      name: 'Ahmad Rahman',
      position: 'Editor in Chief',
      description: 'Berpengalaman 15 tahun dalam dunia jurnalistik',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'
    },
    {
      name: 'Siti Nurhaliza',
      position: 'Managing Editor',
      description: 'Spesialis dalam berita politik dan ekonomi',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'
    },
    {
      name: 'Budi Santoso',
      position: 'Reporter Senior',
      description: 'Fokus pada liputan berita lokal Langsa',
      image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg'
    },
    {
      name: 'Maya Sari',
      position: 'Digital Content Manager',
      description: 'Mengelola konten digital dan media sosial',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
    }
  ];

  const values = [
    {
      icon: Target,
      title: 'Akurat',
      description: 'Menyajikan berita yang faktual dan dapat diverifikasi'
    },
    {
      icon: Heart,
      title: 'Objektif',
      description: 'Memberikan sudut pandang yang berimbang dan tidak memihak'
    },
    {
      icon: Users,
      title: 'Terpercaya',
      description: 'Menjadi sumber informasi yang dapat diandalkan masyarakat'
    },
    {
      icon: Award,
      title: 'Profesional',
      description: 'Menjalankan praktik jurnalistik sesuai kode etik'
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Tentang LangsaPost
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Portal berita terpercaya yang menyajikan informasi terkini untuk masyarakat Langsa dan sekitarnya
          </p>
        </div>

        {/* Hero Section */}
        <div className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src="https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg"
                  alt="LangsaPost Newsroom"
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Visi & Misi Kami
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-coral-500 mb-2">Visi</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Menjadi portal berita digital terdepan yang menyajikan informasi berkualitas tinggi 
                      untuk kemajuan masyarakat Langsa dan Aceh Timur.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-coral-500 mb-2">Misi</h3>
                    <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Menyajikan berita yang akurat, objektif, dan terpercaya</li>
                      <li>• Mengangkat potensi dan prestasi daerah Langsa</li>
                      <li>• Memberikan ruang dialog bagi masyarakat</li>
                      <li>• Mendukung transparansi dan akuntabilitas publik</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Nilai-Nilai Kami
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-coral-100 dark:bg-coral-900 rounded-full flex items-center justify-center">
                      <IconComponent size={32} className="text-coral-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Tim Redaksi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-coral-500 font-medium mb-2">
                    {member.position}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History Section */}
        <div className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Sejarah LangsaPost
            </h2>
            <div className="space-y-6 text-gray-600 dark:text-gray-400">
              <p>
                LangsaPost didirikan pada tahun 2020 dengan visi menjadi portal berita digital 
                yang menghubungkan masyarakat Langsa dengan informasi terkini dan terpercaya. 
                Berawal dari keprihatinan akan minimnya media lokal yang menyajikan berita berkualitas, 
                kami hadir untuk mengisi kekosongan tersebut.
              </p>
              <p>
                Dalam perjalanannya, LangsaPost telah menjadi rujukan utama masyarakat untuk 
                mendapatkan informasi seputar pemerintahan, ekonomi, sosial, budaya, dan olahraga 
                di wilayah Langsa dan sekitarnya. Kami bangga telah melayani lebih dari 100.000 
                pembaca setia setiap bulannya.
              </p>
              <p>
                Komitmen kami adalah terus memberikan pelayanan informasi terbaik dengan 
                memanfaatkan teknologi digital terdepan, sambil tetap menjunjung tinggi 
                nilai-nilai jurnalistik yang profesional dan beretika.
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center bg-coral-50 dark:bg-coral-900 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Mari Berkolaborasi
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Apakah Anda memiliki informasi menarik atau ingin bermitra dengan kami? 
            Jangan ragu untuk menghubungi tim redaksi LangsaPost.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/kontak"
              className="inline-flex items-center justify-center px-6 py-3 bg-coral-500 text-white rounded-md hover:bg-coral-600 transition-colors"
            >
              Hubungi Kami
            </a>
            <a
              href="mailto:redaksi@langsapost.com"
              className="inline-flex items-center justify-center px-6 py-3 border border-coral-500 text-coral-500 rounded-md hover:bg-coral-50 dark:hover:bg-coral-900 transition-colors"
            >
              Email Redaksi
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;