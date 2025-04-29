import { FormResponse, UserData } from '../types/form';

const API_BASE_URL = 'https://dynamic-form-generator-9rl7.onrender.com';

export const createUser = async (userData: UserData): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/create-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('Failed to create user');
  }

  return response.json();
};

export const getForm = async (rollNumber: string): Promise<FormResponse> => {
  const response = await fetch(`${API_BASE_URL}/get-form?rollNumber=${rollNumber}`);

  if (!response.ok) {
    throw new Error('Failed to fetch form');
  }

  return response.json();
}; 