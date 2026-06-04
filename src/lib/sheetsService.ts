import axios from 'axios';

export interface SheetData {
  range: string;
  values: any[][];
}

class SheetsService {
  private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  async getSpreadsheet(spreadsheetId: string, accessToken: string) {
    const response = await axios.get(`${this.baseUrl}/${spreadsheetId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  }

  async readSheet(spreadsheetId: string, range: string, accessToken: string) {
    const response = await axios.get(`${this.baseUrl}/${spreadsheetId}/values/${range}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data.values || [];
  }

  async appendRow(spreadsheetId: string, range: string, values: any[][], accessToken: string) {
    const response = await axios.post(
      `${this.baseUrl}/${spreadsheetId}/values/${range}:append?valueInputOption=RAW`,
      { values },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async updateSheet(spreadsheetId: string, range: string, values: any[][], accessToken: string) {
    const response = await axios.put(
      `${this.baseUrl}/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
      { values },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async createSpreadsheet(title: string, accessToken: string) {
    const response = await axios.post(
      this.baseUrl,
      { properties: { title } },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }
}

export const sheetsService = new SheetsService();
