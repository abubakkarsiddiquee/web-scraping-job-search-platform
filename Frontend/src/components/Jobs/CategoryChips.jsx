// CategoryChips.jsx
import React from 'react';
import './CategoryChips.css';

const categories = [
  "All",
  "Marketing/Sales",
  "IT/Telecommunication",
  "Engineer/Architect",
  "Education/Training",
  "Garments/Textile",
  "Healthcare/Medical",
  "Customer Service/Call Centre",
  "NGO/Development",
  "HR/Org. Development",
  "Accounting/Finance",
  "Bank/Financial Institution",
  "Design/Creative",
  "Production/Operation",
  "Research/Consultancy",
  "Receptionist/Front Desk",
  "Mechanic/Technician",
  "Pharmaceutical",
  "Driver",
  "Security Guard",
  "Media/Event Management",
  "Law/Legal",
  "Plumber/Pipe Fitting",
  "Delivery Man",
  "Nurse",
  "Chef/Cook",
];


function CategoryChips({ selected, onSelect }) {
  return (
    <div className="chip-container">
      {categories.map((cat, index) => (
        <div
          key={index}
          className={`chip ${selected === cat ? 'selected' : ''}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </div>
      ))}
    </div>
  );
}

export default CategoryChips;
