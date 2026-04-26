import apiClient from './apiClient';

/**
 * Internship Service
 * Handles all API interactions related to internships.
 */
const internshipService = {
  /**
   * Search internships with filters
   * @param {Object} params - Search parameters (q, location, domain, workEnvironment, duration, sort)
   * @returns {Promise<Object>} - API response
   */
  searchInternships: async (params) => {
    try {
      const response = await apiClient.get('/internships', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching internships:', error);
      throw error;
    }
  },

  /**
   * Get a single internship by ID
   * @param {string} id - Internship ID
   * @returns {Promise<Object>} - API response
   */
  getInternshipById: async (id) => {
    try {
      const response = await apiClient.get(`/internships/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching internship ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get internships posted by the current employer
   * @returns {Promise<Object>} - API response
   */
  getMyInternships: async () => {
    try {
      const response = await apiClient.get('/internships/my-postings');
      return response.data;
    } catch (error) {
      console.error('Error fetching my internships:', error);
      throw error;
    }
  }
};

export default internshipService;
