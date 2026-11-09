import { renderHook, fireEvent } from '@testing-library/react';
import useClickOutside from './useClickOutside';

function setup(menu) {
  const menuEl = document.createElement('div');
  const triggerEl = document.createElement('div');
  const outsideEl = document.createElement('div');
  document.body.append(menuEl, triggerEl, outsideEl);

  const setMenu = jest.fn();
  const menuRef = { current: menuEl };
  const triggerRef = { current: triggerEl };
  const { unmount } = renderHook(() => useClickOutside(menu, setMenu, menuRef, triggerRef));

  return { unmount, setMenu, menuEl, triggerEl, outsideEl };
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('useClickOutside', () => {
  const openMenu = { visible: true, x: 10, y: 20 };

  test('closes the menu on a click outside it', () => {
    const { setMenu, outsideEl } = setup(openMenu);
    fireEvent.click(outsideEl);
    expect(setMenu).toHaveBeenCalledWith({ ...openMenu, visible: false });
  });

  test('keeps the menu open on a click inside it', () => {
    const { setMenu, menuEl } = setup(openMenu);
    fireEvent.click(menuEl);
    expect(setMenu).not.toHaveBeenCalled();
  });

  test('closes the menu on a right-click outside both the menu and its trigger', () => {
    const { setMenu, outsideEl } = setup(openMenu);
    fireEvent.contextMenu(outsideEl);
    expect(setMenu).toHaveBeenCalledWith({ ...openMenu, visible: false });
  });

  test('keeps the menu open on a right-click on its trigger', () => {
    const { setMenu, triggerEl } = setup(openMenu);
    fireEvent.contextMenu(triggerEl);
    expect(setMenu).not.toHaveBeenCalled();
  });

  test('does nothing when the menu is already hidden', () => {
    const { setMenu, outsideEl } = setup({ visible: false, x: 0, y: 0 });
    fireEvent.click(outsideEl);
    fireEvent.contextMenu(outsideEl);
    expect(setMenu).not.toHaveBeenCalled();
  });

  test('removes its listeners on unmount', () => {
    const { setMenu, outsideEl, unmount } = setup(openMenu);
    unmount();
    fireEvent.click(outsideEl);
    fireEvent.contextMenu(outsideEl);
    expect(setMenu).not.toHaveBeenCalled();
  });
});
