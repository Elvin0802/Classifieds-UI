import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

function HelpPage() {
  const helpItems = [
    {
      id: 1,
      title: "1. Elanım niyə dərc olunmadı?",
      content: "Elanın dərc olunmamasına səbəb Elan yerləşdirmə qaydalarının pozulmasıdır. İstifadəçi yerləşdirmə zamanı qeyd etdiyi elektron poçt ünvanına dərc olunmamış hər elan üzrə elanın silinməsinin səbəbləri göstərilən avtomatik servis məktubu alır. Həmçinin dərc olunmama faktı və onun səbəbi push-bildiriş vasitəsilə mobil tətbiqə göndərilir. Poçta daxil ola bilmədiyi və ya push-bildirişi qaçırdığı təqdirdə istifadəçi elanın dərc olunmama səbəbi ilə Şəxsi kabinetdəki \"Mənim elanlarım\" > \"Dərc olunmamış\" bölməsində tanış ola bilər."
    },
    {
      id: 2,
      title: "2. Elana necə düzəliş edim?",
      content: "\"Mənim elanlarım\" səhifəsində: 1. Şəxsi kabinetə daxil olun. 2. \"Mənim elanlarım\" səhifəsinə keçin. 3. \"Hazırda saytda\" və ya \"Gözləmədə\" bölməsini seçin. 4. İstədiyiniz elanın kartının aşağısında Düzəliş et düyməsini sıxın. 5. Elanı yenilə düyməsini sıxın. Elanınızın səhifəsində: 1. Şəxsi kabinetə daxil olun. 2. Saytda elanınızı tapın və onu açın. 3. Düzəliş et düyməsini tapın və sıxın. 4. Elanı yenilə düyməsini sıxın. Məhsul və ya xidmətin kateqoriyasından asılı olaraq siz qiyməti və təsviri dəyişə, fotoları silə və ya əlavə edə, bəzi digər parametrləri dəyişə bilərsiniz. Bundan sonra elan yoxlamaya göndəriləcək. Yoxlama 2 saatadək çəkə bilər, lakin adətən elanlar Tap.az-da bir neçə dəqiqədən sonra dərc olunur. 24 saat ərzində bir elana yalnız 2 dəfə düzəliş etmək olar."
    }
  ];

  const [openItem, setOpenItem] = useState(null);

  const toggleItem = (itemId) => {
    if (openItem === itemId) {
      setOpenItem(null);
    } else {
      setOpenItem(itemId);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Kömək Mərkəzi</h1>
        
        <div className="space-y-4">
          {helpItems.map((item) => (
            <div key={item.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleItem(item.id)}
                className="flex justify-between items-center w-full p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-lg">{item.title}</span>
                {openItem === item.id ? (
                  <FaChevronUp className="text-gray-500" />
                ) : (
                  <FaChevronDown className="text-gray-500" />
                )}
              </button>
              
              {openItem === item.id && (
                <div className="p-4 bg-white border-t">
                  <p className="text-gray-700 whitespace-pre-line">{item.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HelpPage; 