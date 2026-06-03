import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from './App';
import DetailView from './components/DetailView';

describe('Calypso Air - Bronze Challenge Functionalities', () => {
  
  beforeEach(() => {
    render(<App />);
  });

  it('renders the Presentation View (Logo & Tagline)', () => {
    const brandNames = screen.getAllByText(/Calypso Air/i);
    expect(brandNames[0]).toBeInTheDocument();
    expect(screen.getByText(/Your gateway to the skies/i)).toBeInTheDocument();
  });

 it('adds a new flight to RAM after validation', async () => {
    // 1. Completăm formularul
    fireEvent.change(screen.getByPlaceholderText(/Flight ID/i), { target: { value: '999' } });
    fireEvent.change(screen.getByPlaceholderText(/Destination/i), { target: { value: 'Berlin' } });
    fireEvent.change(screen.getByPlaceholderText(/Pilot Name/i), { target: { value: 'Test Pilot' } });
    
    // 2. Click pe butonul de adăugare
    fireEvent.click(screen.getByText(/\+ Add Flight/i));

    // 3. Mergem la pagina 3 unde va fi adăugat Berlin (avem 6 zboruri + 1 nou = 7 total, deci pagina 3)
    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton); // Pagina 2
    fireEvent.click(nextButton); // Pagina 3

    expect(screen.getByText('Berlin')).toBeInTheDocument();
  });

  it('updates flight status (Toggle Status)', () => {
    const toggleButtons = screen.getAllByText(/Toggle Status/i);
    fireEvent.click(toggleButtons[0]);
    const delayedStatus = screen.getAllByText(/Delayed/i);
    expect(delayedStatus.length).toBeGreaterThan(0);
  });

  it('erases a flight from the table', () => {
    const eraseButtons = screen.getAllByText(/Erase/i);
    const flightId = screen.getByText('1'); 
    fireEvent.click(eraseButtons[0]);
    expect(flightId).not.toBeInTheDocument();
  });

  it('navigates to Detail View and back', () => {
    const detailButtons = screen.getAllByText(/Details/i);
    fireEvent.click(detailButtons[0]);
    expect(screen.getByText(/Flight Details:/i)).toBeInTheDocument();
    const backButton = screen.getByText(/Back to List/i);
    fireEvent.click(backButton);
    expect(screen.getByRole('heading', { name: /Flight Management/i })).toBeInTheDocument();
  });

  it('shows error alert when adding flight with existing ID', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    const idInput = screen.getByPlaceholderText(/Flight ID/i);
    const addButton = screen.getByText(/\+ Add Flight/i);

    fireEvent.change(idInput, { target: { value: '1' } });
    fireEvent.click(addButton);

    expect(alertMock).toHaveBeenCalled();
    alertMock.mockRestore();
  });

  it('handles empty flight data in DetailView', () => {
    const { container } = render(<DetailView flight={null} onBack={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('navigates through pagination', () => {
    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton);
    expect(screen.getByText(/Page 2/i)).toBeInTheDocument();
    
    const prevButton = screen.getByText(/Previous/i);
    fireEvent.click(prevButton);
    expect(screen.getByText(/Page 1/i)).toBeInTheDocument();
  });
});