import React, { useState, useEffect } from 'react';
import { FormResponse, FormSection, FormField, FormData } from '../types/form';
import { getForm } from '../services/api';

interface DynamicFormProps {
  rollNumber: string;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ rollNumber }) => {
  const [formData, setFormData] = useState<FormResponse | null>(null);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [formValues, setFormValues] = useState<FormData>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await getForm(rollNumber);
        setFormData(response);
      } catch (error) {
        console.error('Failed to fetch form:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [rollNumber]);

  const validateField = (field: FormField, value: string): string => {
    if (field.required && !value) {
      return field.validation?.message || 'This field is required';
    }

    if (field.minLength && value.length < field.minLength) {
      return `Minimum length is ${field.minLength} characters`;
    }

    if (field.maxLength && value.length > field.maxLength) {
      return `Maximum length is ${field.maxLength} characters`;
    }

    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }

    return '';
  };

  const validateSection = (section: FormSection): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    section.fields.forEach(field => {
      const value = formValues[field.fieldId] as string;
      const error = validateField(field, value);
      if (error) {
        newErrors[field.fieldId] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (fieldId: string, value: string) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
    setErrors(prev => ({ ...prev, [fieldId]: '' }));
  };

  const handleNext = () => {
    if (!formData) return;

    const currentSectionData = formData.form.sections[currentSection];
    if (validateSection(currentSectionData)) {
      setCurrentSection(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentSection(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (!formData) return;

    const currentSectionData = formData.form.sections[currentSection];
    if (validateSection(currentSectionData)) {
      console.log('Form Data:', formValues);
    }
  };

  if (loading) return <div data-testid="loading-state">Loading form...</div>;
  if (!formData) return <div data-testid="error-state">Failed to load form</div>;

  const currentSectionData = formData.form.sections[currentSection];
  const isLastSection = currentSection === formData.form.sections.length - 1;

  return (
    <div className="dynamic-form" data-testid="dynamic-form">
      <h2 data-testid="form-title">{formData.form.formTitle}</h2>
      <div className="form-section" data-testid={`section-${currentSectionData.sectionId}`}>
        <h3 data-testid={`section-title-${currentSectionData.sectionId}`}>{currentSectionData.title}</h3>
        <p data-testid={`section-description-${currentSectionData.sectionId}`}>{currentSectionData.description}</p>
        {currentSectionData.fields.map(field => (
          <div key={field.fieldId} className="form-field" data-testid={`field-container-${field.fieldId}`}>
            <label htmlFor={field.fieldId} data-testid={`label-${field.fieldId}`}>{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.fieldId}
                value={formValues[field.fieldId] as string || ''}
                onChange={(e) => handleChange(field.fieldId, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                data-testid={field.dataTestId}
              />
            ) : field.type === 'dropdown' ? (
              <select
                id={field.fieldId}
                value={formValues[field.fieldId] as string || ''}
                onChange={(e) => handleChange(field.fieldId, e.target.value)}
                required={field.required}
                data-testid={field.dataTestId}
              >
                <option value="" data-testid={`${field.dataTestId}-default-option`}>Select an option</option>
                {field.options?.map(option => (
                  <option 
                    key={option.value} 
                    value={option.value}
                    data-testid={option.dataTestId || `${field.dataTestId}-option-${option.value}`}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'radio' ? (
              <div className="radio-group" data-testid={`radio-group-${field.fieldId}`}>
                {field.options?.map(option => (
                  <label key={option.value} data-testid={`radio-label-${option.value}`}>
                    <input
                      type="radio"
                      name={field.fieldId}
                      value={option.value}
                      checked={formValues[field.fieldId] === option.value}
                      onChange={(e) => handleChange(field.fieldId, e.target.value)}
                      data-testid={option.dataTestId || `${field.dataTestId}-${option.value}`}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            ) : field.type === 'checkbox' ? (
              <div className="checkbox-group" data-testid={`checkbox-group-${field.fieldId}`}>
                {field.options?.map(option => (
                  <label key={option.value} data-testid={`checkbox-label-${option.value}`}>
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={(formValues[field.fieldId] as string[] || []).includes(option.value)}
                      onChange={(e) => {
                        const currentValues = (formValues[field.fieldId] as string[] || []);
                        const newValues = e.target.checked
                          ? [...currentValues, option.value]
                          : currentValues.filter(v => v !== option.value);
                        handleChange(field.fieldId, newValues.join(','));
                      }}
                      data-testid={option.dataTestId || `${field.dataTestId}-${option.value}`}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            ) : (
              <input
                type={field.type}
                id={field.fieldId}
                value={formValues[field.fieldId] as string || ''}
                onChange={(e) => handleChange(field.fieldId, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                data-testid={field.dataTestId}
              />
            )}
            {errors[field.fieldId] && (
              <div className="error-message" data-testid={`error-${field.fieldId}`}>
                {errors[field.fieldId]}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="form-navigation" data-testid="form-navigation">
        {currentSection > 0 && (
          <button 
            onClick={handlePrev} 
            data-testid="prev-button"
          >
            Previous
          </button>
        )}
        {!isLastSection ? (
          <button 
            onClick={handleNext} 
            data-testid="next-button"
          >
            Next
          </button>
        ) : (
          <button 
            onClick={handleSubmit} 
            data-testid="submit-button"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default DynamicForm; 