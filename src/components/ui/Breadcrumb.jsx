import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import PropTypes from 'prop-types';

const Breadcrumb = ({ items, showHome = true }) => {
  return (
    <nav className="flex items-center flex-wrap space-x-2 text-sm text-gray-500 mb-4">
      {showHome && (
        <Link to="/" className="hover:text-blue-600">
          Ana Sayfa
        </Link>
      )}
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {(index > 0 || showHome) && <FaChevronRight className="text-gray-400" />}
          {index === items.length - 1 ? (
            <span className="text-gray-800 font-medium">{item.label}</span>
          ) : (
            <Link
              to={item.path}
              className="hover:text-blue-600"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string
    })
  ).isRequired,
  showHome: PropTypes.bool
};

export default Breadcrumb; 