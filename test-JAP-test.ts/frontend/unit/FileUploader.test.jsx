/**
 * ============================================================
 * FRONTEND — UNIT TESTS: FileUploader.js
 * Metodología TDD: Red → Green → Refactor
 * Autor: test-JAP
 * Framework: Jest + React Testing Library
 * ============================================================
 *
 * Cubre: renderizado, selección de archivo, upload exitoso,
 *        indicador de carga, manejo de errores de upload.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileUploader from '../../../frontend/src/components/FileUploader';

// ─── Mock de fetch global ─────────────────────────────────────────────────────
const mockFetch = jest.fn();
global.fetch = mockFetch;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const mockOnChange = jest.fn();
const mockOnUpload = jest.fn();

const renderUploader = () =>
  render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

const buildFile = (name = 'cv.pdf', type = 'application/pdf') =>
  new File(['contenido'], name, { type });

// ─── Suite: Renderizado inicial ───────────────────────────────────────────────
describe('FRONTEND › FileUploader › Renderizado inicial', () => {
  beforeEach(() => jest.clearAllMocks());

  it('TDD-F-FU-01 | muestra el campo de archivo', () => {
    renderUploader();
    expect(screen.getByLabelText(/file/i)).toBeInTheDocument();
  });

  it('TDD-F-FU-02 | muestra el botón de subir archivo', () => {
    renderUploader();
    expect(screen.getByRole('button', { name: /subir archivo/i })).toBeInTheDocument();
  });

  it('TDD-F-FU-03 | muestra "Selected file:" vacío al inicio', () => {
    renderUploader();
    expect(screen.getByText(/Selected file:/i)).toBeInTheDocument();
  });

  it('TDD-F-FU-04 | no muestra mensaje de éxito al inicio', () => {
    renderUploader();
    expect(screen.queryByText(/subido con éxito/i)).not.toBeInTheDocument();
  });
});

// ─── Suite: Selección de archivo ─────────────────────────────────────────────
describe('FRONTEND › FileUploader › Selección de archivo', () => {
  beforeEach(() => jest.clearAllMocks());

  it('TDD-F-FU-05 | muestra el nombre del archivo seleccionado', async () => {
    renderUploader();
    const input = screen.getByLabelText(/file/i);
    const file = buildFile('curriculum.pdf');

    await userEvent.upload(input, file);

    expect(screen.getByText(/curriculum\.pdf/i)).toBeInTheDocument();
  });

  it('TDD-F-FU-06 | llama a onChange con el archivo seleccionado', async () => {
    renderUploader();
    const input = screen.getByLabelText(/file/i);
    const file = buildFile('cv.pdf');

    await userEvent.upload(input, file);

    expect(mockOnChange).toHaveBeenCalledWith(file);
  });
});

// ─── Suite: Upload de archivo ─────────────────────────────────────────────────
describe('FRONTEND › FileUploader › Upload', () => {
  beforeEach(() => jest.clearAllMocks());

  it('TDD-F-FU-07 | llama a fetch POST /upload al hacer clic en subir', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ filePath: 'uploads/cv.pdf', fileType: 'application/pdf' }),
    });

    renderUploader();
    const input = screen.getByLabelText(/file/i);
    await userEvent.upload(input, buildFile());
    await userEvent.click(screen.getByRole('button', { name: /subir archivo/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('http://localhost:3010/upload');
    expect(options.method).toBe('POST');
  });

  it('TDD-F-FU-08 | llama a onUpload con los datos del servidor tras upload exitoso', async () => {
    const fileData = { filePath: 'uploads/cv.pdf', fileType: 'application/pdf' };
    mockFetch.mockResolvedValue({ ok: true, json: async () => fileData });

    renderUploader();
    const input = screen.getByLabelText(/file/i);
    await userEvent.upload(input, buildFile());
    await userEvent.click(screen.getByRole('button', { name: /subir archivo/i }));

    await waitFor(() => expect(mockOnUpload).toHaveBeenCalledWith(fileData));
  });

  it('TDD-F-FU-09 | muestra mensaje de éxito tras upload correcto', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ filePath: 'uploads/cv.pdf', fileType: 'application/pdf' }),
    });

    renderUploader();
    const input = screen.getByLabelText(/file/i);
    await userEvent.upload(input, buildFile());
    await userEvent.click(screen.getByRole('button', { name: /subir archivo/i }));

    await waitFor(() =>
      expect(screen.getByText(/subido con éxito/i)).toBeInTheDocument()
    );
  });

  it('TDD-F-FU-10 | muestra spinner mientras se sube el archivo', async () => {
    // Promesa que nunca resuelve para mantener estado loading
    mockFetch.mockReturnValue(new Promise(() => {}));

    renderUploader();
    const input = screen.getByLabelText(/file/i);
    await userEvent.upload(input, buildFile());
    await userEvent.click(screen.getByRole('button', { name: /subir archivo/i }));

    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner tiene role="status"
  });

  it('TDD-F-FU-11 | no llama a fetch si no hay archivo seleccionado', async () => {
    renderUploader();
    await userEvent.click(screen.getByRole('button', { name: /subir archivo/i }));
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('TDD-F-FU-12 | maneja error de fetch sin romper la interfaz', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    renderUploader();
    const input = screen.getByLabelText(/file/i);
    await userEvent.upload(input, buildFile());
    await userEvent.click(screen.getByRole('button', { name: /subir archivo/i }));

    await waitFor(() =>
      // El spinner debe desaparecer y el botón debe ser accesible nuevamente
      expect(screen.getByRole('button', { name: /subir archivo/i })).toBeInTheDocument()
    );
  });
});
