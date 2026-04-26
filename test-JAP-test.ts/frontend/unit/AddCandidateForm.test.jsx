/**
 * ============================================================
 * FRONTEND — UNIT TESTS: AddCandidateForm.js
 * Metodología TDD: Red → Green → Refactor
 * Autor: test-JAP
 * Framework: Jest + React Testing Library
 * ============================================================
 *
 * Cubre: renderizado inicial, inputs controlados, secciones
 *        dinámicas (educación / experiencia), submit exitoso,
 *        manejo de errores HTTP 400/500.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddCandidateForm from '../../../frontend/src/components/AddCandidateForm';

// ─── Mock de fetch global ─────────────────────────────────────────────────────
const mockFetch = jest.fn();
global.fetch = mockFetch;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const renderForm = () => render(<AddCandidateForm />);

const fillBasicFields = async () => {
  await userEvent.type(screen.getByLabelText(/nombre/i), 'Ana');
  await userEvent.type(screen.getByLabelText(/apellido/i), 'García');
  await userEvent.type(screen.getByLabelText(/email/i), 'ana@example.com');
  await userEvent.type(screen.getByLabelText(/teléfono/i), '612345678');
};

// ─── Suite: Renderizado inicial ───────────────────────────────────────────────
describe('FRONTEND › AddCandidateForm › Renderizado inicial', () => {
  it('TDD-F-ACF-01 | renderiza el formulario sin errores', () => {
    const { container } = renderForm();
    expect(container).toBeTruthy();
  });

  it('TDD-F-ACF-02 | muestra campos básicos vacíos al inicio', () => {
    renderForm();
    expect(screen.getByRole('textbox', { name: /nombre/i })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: /apellido/i })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: /email/i })).toHaveValue('');
  });

  it('TDD-F-ACF-03 | no muestra mensaje de éxito al inicio', () => {
    renderForm();
    expect(screen.queryByText(/añadido con éxito/i)).not.toBeInTheDocument();
  });

  it('TDD-F-ACF-04 | no muestra mensaje de error al inicio', () => {
    renderForm();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('TDD-F-ACF-05 | muestra botón de envío', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /enviar|guardar|añadir/i })).toBeInTheDocument();
  });
});

// ─── Suite: Inputs controlados ────────────────────────────────────────────────
describe('FRONTEND › AddCandidateForm › Inputs controlados', () => {
  it('TDD-F-ACF-06 | actualiza el valor de firstName al escribir', async () => {
    renderForm();
    const input = screen.getByLabelText(/nombre/i);
    await userEvent.type(input, 'Carlos');
    expect(input).toHaveValue('Carlos');
  });

  it('TDD-F-ACF-07 | actualiza el valor de email al escribir', async () => {
    renderForm();
    const input = screen.getByLabelText(/email/i);
    await userEvent.type(input, 'carlos@test.com');
    expect(input).toHaveValue('carlos@test.com');
  });
});

// ─── Suite: Secciones dinámicas ───────────────────────────────────────────────
describe('FRONTEND › AddCandidateForm › Secciones dinámicas', () => {
  it('TDD-F-ACF-08 | añade una sección de educación al hacer clic en "Añadir educación"', async () => {
    renderForm();
    const btn = screen.getByRole('button', { name: /añadir educación/i });
    await userEvent.click(btn);
    expect(screen.getByPlaceholderText(/institución/i)).toBeInTheDocument();
  });

  it('TDD-F-ACF-09 | elimina sección de educación al hacer clic en el botón de eliminar', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: /añadir educación/i }));
    const removeBtn = screen.getByRole('button', { name: /eliminar|borrar/i });
    await userEvent.click(removeBtn);
    expect(screen.queryByPlaceholderText(/institución/i)).not.toBeInTheDocument();
  });

  it('TDD-F-ACF-10 | añade sección de experiencia laboral', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: /añadir experiencia/i }));
    expect(screen.getByPlaceholderText(/empresa/i)).toBeInTheDocument();
  });

  it('TDD-F-ACF-11 | admite múltiples secciones de educación', async () => {
    renderForm();
    const btn = screen.getByRole('button', { name: /añadir educación/i });
    await userEvent.click(btn);
    await userEvent.click(btn);
    const inputs = screen.getAllByPlaceholderText(/institución/i);
    expect(inputs).toHaveLength(2);
  });
});

// ─── Suite: Envío del formulario ──────────────────────────────────────────────
describe('FRONTEND › AddCandidateForm › Envío', () => {
  beforeEach(() => jest.clearAllMocks());

  it('TDD-F-ACF-12 | muestra mensaje de éxito cuando API devuelve 201', async () => {
    mockFetch.mockResolvedValue({ status: 201 });

    renderForm();
    await fillBasicFields();
    await userEvent.click(screen.getByRole('button', { name: /enviar|guardar|añadir/i }));

    await waitFor(() =>
      expect(screen.getByText(/añadido con éxito/i)).toBeInTheDocument()
    );
  });

  it('TDD-F-ACF-13 | muestra error cuando API devuelve 400', async () => {
    mockFetch.mockResolvedValue({
      status: 400,
      json: async () => ({ message: 'Datos inválidos' }),
    });

    renderForm();
    await fillBasicFields();
    await userEvent.click(screen.getByRole('button', { name: /enviar|guardar|añadir/i }));

    await waitFor(() =>
      expect(screen.getByText(/error al añadir candidato/i)).toBeInTheDocument()
    );
  });

  it('TDD-F-ACF-14 | muestra error cuando API devuelve 500', async () => {
    mockFetch.mockResolvedValue({ status: 500 });

    renderForm();
    await fillBasicFields();
    await userEvent.click(screen.getByRole('button', { name: /enviar|guardar|añadir/i }));

    await waitFor(() =>
      expect(screen.getByText(/error interno del servidor/i)).toBeInTheDocument()
    );
  });

  it('TDD-F-ACF-15 | llama a fetch con method POST y Content-Type correcto', async () => {
    mockFetch.mockResolvedValue({ status: 201 });

    renderForm();
    await fillBasicFields();
    await userEvent.click(screen.getByRole('button', { name: /enviar|guardar|añadir/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('http://localhost:3010/candidates');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('TDD-F-ACF-16 | oculta mensaje de éxito al mostrar nuevo error y viceversa', async () => {
    // Primera llamada: éxito → luego 400
    mockFetch
      .mockResolvedValueOnce({ status: 201 })
      .mockResolvedValueOnce({
        status: 400,
        json: async () => ({ message: 'Email duplicado' }),
      });

    renderForm();
    await fillBasicFields();
    const submitBtn = screen.getByRole('button', { name: /enviar|guardar|añadir/i });

    await userEvent.click(submitBtn);
    await waitFor(() => screen.getByText(/añadido con éxito/i));

    await userEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.queryByText(/añadido con éxito/i)).not.toBeInTheDocument();
      expect(screen.getByText(/error al añadir candidato/i)).toBeInTheDocument();
    });
  });
});
