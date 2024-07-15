import axios from 'axios';
import { apiEndpoint } from '../config-global';
import { HOST_API } from 'src/config-global';
import FileSaver from 'file-saver';
// -----------------------jose ------------------------------------------

// To upload a file
export async function getUploadUrl(idToken, todoId) {
  const response = await axios.post(`${apiEndpoint}/${todoId}/pdf`, '', {
    headers: {
      'Content-Type': 'application/json',
      // prettier-ignore
      'Authorization': `Bearer ${idToken}`,
    },
  });

  return response.data.uploadUrl;
}

export async function uploadFile(uploadUrl, file) {
  try {
    const response = await axios.put(
      uploadUrl,

      file,

      {
        headers: {
          'Content-Type': 'application/pdf',
        },
      }
    );

    console.log(response);
  } catch (error) {
    console.log(error);
  }
}

// Delete fichas tecnicas

export const deleteFicha = async (data_key, idToken) => {
  let data = {
    key: data_key,
  };

  try {
    // Validate data
    if (!data) throw new Error('Data is required');

    // Make request with axios
    const response = await axios({
      url: `${apiEndpoint}/delete`,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      data, // pass data in request body
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting object:', error);
    throw error;
  }
};

// Putting data to the Laser

export const putDataLaser = async (idToken, data) => {
  const response = await fetch(`${apiEndpoint}/laserUploadCarga`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // prettier-ignore
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify(data),
  });

  // Handle the response as needed
  if (response.ok) {
    // Request was successful
    const responseData = await response.json();
    return responseData;
  } else {
    // Request failed
    throw new Error(`HTTP error ${response.status}`);
  }
};

// getting all data from laser

export const getDataLaser = async (idToken) => {
  try {
    const response = await fetch(`${apiEndpoint}/laserGetCarga`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // prettier-ignore
        'Authorization': `Bearer ${idToken}`,
      },
    });

    // Handle the response as needed
    if (response.ok) {
      // Request was successful
      const responseData = await response.json();
      return responseData;
    } else {
      // Request failed
      const errorData = await response.json();
      throw new Error(`HTTP error ${response.status}: ${errorData.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error fetching laser data:', error);
    // Return a default value or handle the error in a different way
    return [];
  }
};
//getting average value data 
export const getAverageLaserValue = async (idToken) => {
  try {
    const response = await fetch(`${apiEndpoint}/averageValue`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // prettier-ignore
        'Authorization': `Bearer ${idToken}`,
      },
    });

    // Handle the response as needed
    if (response.ok) {
      // Request was successful
      const responseData = await response.json();
      return responseData;
    } else {
      // Request failed
      const errorData = await response.json();
      throw new Error(`HTTP error ${response.status}: ${errorData.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error fetching laser data:', error);
    // Return a default value or handle the error in a different way
    return [];
  }
};



//updating a file from the laser 
export const updateLaser = async (pv, cnc, status, idToken) => {
  try {
    const response = await fetch(`${apiEndpoint}/laserUpdateCarga`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ pv, cnc, status }),
    });

    if (response.ok) {
      // Laser update successful
      const responseData = await response.text(); // Change from response.json()
      console.log('Laser update successful:', responseData);
      return responseData;
    } else {
      // Handle error response
      const errorData = await response.text(); // Change from response.json()
      console.error('Error updating laser:', errorData);
      throw new Error(errorData);
    }
  } catch (error) {
    console.error('Error updating laser:', error);
    throw error;
  }
};








export async function downloadFicha(key, idToken) {
  // Validate key
  if (!key) {
    throw new Error('Key is required');
  }

  // Get signed URL from Lambda function
  const response = await fetch(`${apiEndpoint}/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // prettier-ignore
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ key }),
  });

  const reader = response.body.getReader();

  let content = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    content += new TextDecoder().decode(value);
  }

  const response_link = await fetch(content);
  const blob = await response_link.blob();

  // Save file
  console.log(key, 'KEY');
  const name = key.split('/').pop();
  console.log(name, 'KEY');
  FileSaver.saveAs(blob, name);
}

// Getting Cognito Users

export async function getCognitoUsers(idToken) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      // prettier-ignore
      'Authorization': `Bearer ${idToken}`,
    };

    const response = await axios.get(`${apiEndpoint}/users`, {
      headers: headers,
    });
    return response.data;
  } catch (error) {
    console.log('Error fetching users:', error);
  }
}

// all s3 files

export async function fetchFiles(idToken) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      // prettier-ignore
      'Authorization': `Bearer ${idToken}`,
    };

    const response = await axios.get(`${apiEndpoint}/s3fichaslist`, {
      headers: headers,
    });
    return response.data;
  } catch (error) {
    console.log('Error fetching users:', error);
  }
}

// gettin fichas by user

export async function S3userFichasLists(usuario, idToken) {
  const headers = {
    'Content-Type': 'application/json',
    // prettier-ignore
    'Authorization': `Bearer ${idToken}`,
  };

  const res = await fetch(`${apiEndpoint}/s3userfichaslist?folder=${usuario}`, {
    headers: headers,
  });

  return {
    props: {
      files: await res.json(),
    },
  };
}

// ----------------------------------------------------------------------
// ==================================================================================
// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    login: '/api/auth/login',
    register: '/api/auth/register',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
};


