import {afterEach,it,expect,vi} from 'vitest';
import {injectInventoryTab} from '../src/collection/CollectionTab';
afterEach(()=>document.body.replaceChildren());

it('injects one keyboard-accessible inventory tab after Cijfers and restores native active semantics',()=>{
 document.body.innerHTML='<sl-tab-bar role="tablist"><sl-tab role="tab" aria-selected="false" tabindex="-1">Rooster</sl-tab><sl-tab role="tab" aria-selected="true" tabindex="0">Cijfers</sl-tab><sl-tab role="tab" aria-selected="false" tabindex="-1">Berichten</sl-tab></sl-tab-bar>';
 const select=vi.fn(),leave=vi.fn(),first=injectInventoryTab(select,leave)!;
 expect(first.button.parentElement?.children[2]).toBe(first.button);expect(first.button.getAttribute('role')).toBe('tab');expect(first.button.getAttribute('aria-controls')).toBe('po-inventory-page');
 expect(injectInventoryTab(select,leave)?.button).toBe(first.button);expect(document.querySelectorAll('.po-inventory-tab')).toHaveLength(1);
 first.setActive(true);expect(first.button.getAttribute('aria-selected')).toBe('true');expect(document.querySelector('[role="tab"]:not(.po-inventory-tab)[aria-selected="true"]')).toBeNull();
 first.button.click();expect(select).toHaveBeenCalledWith(first.button);
 const rooster=document.querySelector<HTMLElement>('sl-tab')!;rooster.click();expect(leave).toHaveBeenCalledWith(rooster);
 first.setActive(false);expect(document.querySelectorAll('[role="tab"][aria-selected="true"]')).toHaveLength(1);expect(document.querySelector('sl-tab[aria-selected="true"]')?.textContent).toBe('Cijfers');
 first.remove();expect(document.querySelector('.po-inventory-tab')).toBeNull();
});

it('does not inject outside the observed native tab bar',()=>{document.body.innerHTML='<nav><a href="/cijfers">Cijfers</a></nav>';expect(injectInventoryTab(vi.fn(),vi.fn())).toBeNull();});
