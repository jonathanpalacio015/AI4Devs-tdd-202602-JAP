/**
 * ============================================================
 * FRONTEND — UNIT TESTS: candidateService.js
 * Metodología TDD: Red → Green → Refactor
 * Autor: test-JAP
 * Framework: Jest + axios mock
 * ============================================================
 *
 * Cubre: uploadCV() y sendCandidateData()
 *   - Llamadas HTTP correctas
 *   - Retorno de datos del servidor
 *   - Manejo de errores de red y de servidor
 */

jest.mock('axios');

import axios from 'axios';
import { uploadCV, sendCandidateData } from '../../../frontend/src/services/candidateService';

const mockAxios = axios as jest.Mocked<typeof axios>;

// ─── Suite: uploadCV ──────────────────────────────────────────────────────────
describe('FRONTEND › candidateService › uploadCV', () => {
  beforeEach(() => jest.clearAllMocks());

  it('TDD-F-SVC-01 | llama a axios.post con la URL correcta y FormData', async () => {
    const fileData = { filePath: 'uploads/cv.pdf', fileType: 'application/pdf' };
    (mockAxios.post as jest.Mock).mockResolvedValue({ data: fileData });

    const file = new File(['test'], 'cv.pdf', { type: 'application/pdf' });
    const result = await uploadCV(file);

    expect(mockAxios.post).toHaveBeenCalledWith(
      'http://localhost:3010/upload',
      expect.any(FormData),
      expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } })
    );
    expect(result).toEqual(fileData);
  });

  it('TDD-F-SVC-02 | lanza Error cuando axios.post falla en uploadCV', async () => {
    (mockAxios.post as jest.Mock).mockRejectedValue({
      response: { data: 'Server error' },
    });

    const file = new File(['test'], 'cv.pdf', { type: 'application/pdf' });

    await expect(uploadCV(file)).rejects.toThrow('Error al subir el archivo:');
  });

  it('TDD-F-SVC-03 | el FormData contiene la clave "file"', async () => {
    let capturedFormData: FormData | undefined;
    (mockAxios.post as jest.Mock).mockImplementation((_url, data) => {
      capturedFormData = data;
      return Promise.resolve({ data: {} });
    });

    const file = new File(['test'], 'cv.pdf', { type: 'application/pdf' });
    await uploadCV(file);

    expect(capturedFormData?.get('file')).toBe(file);
  });
});

// ─── Suite: sendCandidateData ─────────────────────────────────────────────────
describe('FRONTEND › candidateService › sendCandidateData', () => {
  beforeEach(() => jest.clearAllMocks());

  const candidatePayload = {
    firstName: 'Ana',
    lastName: 'López',
    email: 'ana@example.com',
    phone: '699000111',
  };

  it('TDD-F-SVC-04 | llama a axios.post con la URL y datos correctos', async () => {
    (mockAxios.post as jest.Mock).mockResolvedValue({ data: { id: 1, ...candidatePayload } });

    await sendCandidateData(candidatePayload);

    expect(mockAxios.post).toHaveBeenCalledWith(
      'http://localhost:3010/candidates',
      candidatePayload
    );
  });

  it('TDD-F-SVC-05 | retorna los datos del candidato guardado', async () => {
    const response = { id: 1, ...candidatePayload };
    (mockAxios.post as jest.Mock).mockResolvedValue({ data: response });

    const result = await sendCandidateData(candidatePayload);
    expect(result).toEqual(response);
  });

  it('TDD-F-SVC-06 | lanza Error cuando axios.post falla en sendCandidateData', async () => {
    (mockAxios.post as jest.Mock).mockRejectedValue({
      response: { data: 'Invalid email' },
    });

    await expect(sendCandidateData(candidatePayload)).rejects.toThrow(
      'Error al enviar datos del candidato:'
    );
  });
});
