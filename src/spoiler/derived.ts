// Numerical dependencies are unproven. Never calculate or release a guessed summary.
export const DERIVED_SELECTOR='sl-vakgemiddelde-item-cijfer, sl-vakresultaten .gemiddelde-wrapper';
export function presentDerived(root:Element){
 for(const owner of root.querySelectorAll<HTMLElement>(DERIVED_SELECTOR)){
 if(owner.nextElementSibling?.classList.contains('po-derived-placeholder'))continue;
 const safe=document.createElement('span');safe.className='po-derived-placeholder';safe.textContent='Cijfer tijdelijk verborgen';owner.after(safe);
 }
}
// Overview cells stay hidden, preserving table structure. An extension-owned caption explains it.
export function presentOverview(root:Element){
 for(const overview of root.querySelectorAll<HTMLElement>('sl-cijfer-overzicht')){
 if(overview.querySelector('.po-overview-status'))continue;
 const status=document.createElement('p');status.className='po-overview-status';status.textContent='Cijfers controleren… Overzicht en gemiddelden blijven verborgen totdat de koppeling is gevalideerd.';overview.prepend(status);
 }
}
