import { useState } from 'react';
import { FaFlag } from 'react-icons/fa';
import ReportModal from '../report/ReportModal';

function ReportAdForm({ adId, adTitle, onClose }) {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleClose = () => {
    setIsModalOpen(false);
    onClose();
  };

  return (
    <ReportModal
      adId={adId}
      adTitle={adTitle}
      isOpen={isModalOpen}
      onClose={handleClose}
    />
  );
}

export default ReportAdForm; 