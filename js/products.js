const toggleAddedItemsBox = document.querySelector('.addedItemsBox');
const addedItemsBox = document.querySelector('.addedItems');
const countAddedItems = document.querySelector('.addedItemsBox p');
const orderTotal = document.querySelector('.orderTotal');
const container = document.querySelector('.container');
const BtnConfirmOrder = document.querySelector('.BtnConfirmOrder');
const confirmOrderBox = document.querySelector('.confirm-order-box');
const oderContent = document.querySelector('.confirm-order-box .order-content');
const btnStartNewOrder = document.querySelector('.start-new-Order');
const productsData = [];



//#region Requêtes fetch() et chargement des données du fichier 'data.json'
fetch('./assets/data.json')
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Erreur lors du chargement du fichier JSON');
  })
  .then(data => {
    data.forEach(product => {
      const html = `
        <div class="card">
          <div class="product">
            <img src="${product.image.desktop}" class="img" alt="${product.name}" />
            <div class="addToCart" data-product-id="${product.id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" fill="none" viewBox="0 0 21 20">
                <g fill="#C73B0F" clip-path="url(#a)">
                  <path d="M6.583 18.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM15.334 18.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM3.446 1.752a.625.625 0 0 0-.613-.502h-2.5V2.5h1.988l2.4 11.998a.625.625 0 0 0 .612.502h11.25v-1.25H5.847l-.5-2.5h11.238a.625.625 0 0 0 .61-.49l1.417-6.385h-1.28L16.083 10H5.096l-1.65-8.248Z"/>
                  <path d="M11.584 3.75v-2.5h-1.25v2.5h-2.5V5h2.5v2.5h1.25V5h2.5V3.75h-2.5Z"/>
                </g>
                <defs><clipPath id="a"><path fill="#fff" d="M.333 0h20v20h-20z"/></clipPath></defs>
              </svg>
              <p>Add to Cart</p>
              <div class="qty-box">
                <i class="fa fa-minus-circle decrementQty" aria-hidden="true"></i>
                <span id="qtyValue">0</span>
                <i class="fa fa-plus-circle incrementQty" aria-hidden="true"></i>
              </div>
            </div>
          </div><br>
          <div class="price">
            <p class="product_name">${product.name}</p>
            <p class="product_description">${product.category}</p>
            <span class="product_price">$${product.price.toFixed(2)}</span>
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', html);
    });

    document.querySelectorAll('.addToCart').forEach(btn => {
      btn.addEventListener('click', function (e) {
        this.parentElement.classList.add('addingItems');
        let productQte = btn.querySelector('.qty-box span');
        const idProduit = btn.getAttribute('data-product-id');
        const produitActuel = data.find(p => p.id == idProduit);

        if (e.target.classList.contains('incrementQty')) {
          const quantite = mettreAjourQuantite(productQte, 'increment');
          ajouterAuPanier(produitActuel, quantite);
        }

        if (e.target.classList.contains('decrementQty')) {
          const quantite = mettreAjourQuantite(productQte, 'decrement');
          ajouterAuPanier(produitActuel, quantite);
        }
      });
    });
  })
  .catch(error => {
    console.error('Erreur :', error);
  });

//#endregion

//#region Opérations sur les articles

const ajouterAuPanier = (product, quantite) => {
  const produitExistant = Array.from(addedItemsBox.querySelectorAll('.itemBox')).find(item => {
    return item.querySelector('.item').textContent.trim() === product.name.trim();
  });

  if (!produitExistant) {
    if (quantite > 0) {
      let prixTotal = (quantite * product.price).toFixed(2);
      const html = `
        <div class="itemBox">
          <div class="first-item">
            <p class="item">${product.name}</p>
            <p class="itemInfo">
              <span class="qty">${quantite}x</span>
              <span class="dessertPrice">@${product.price.toFixed(2)}</span>
              <strong class="qtyPrice">$${prixTotal}</strong>
            </p>
          </div>
          <i class="fa-solid fa-close"></i>
        </div>
      `;
      addedItemsBox.insertAdjacentHTML('beforeend', html);
    }
  } else {
    const itemInfo = produitExistant.querySelector('.itemInfo');
    const nouveauPrix = (product.price * quantite).toFixed(2);
    itemInfo.innerHTML = `<span class="qty">${quantite}x</span> <span class="dessertPrice">@${product.price.toFixed(2)}</span> <strong class="qtyPrice">$${nouveauPrix}</strong>`;

    addedItemsBox.addEventListener('click', function (e) {
      if (e.target.classList.contains('fa-close')) {
        const produitBox = e.target.closest('.itemBox');
        if (produitBox) {
          const nomProduit = produitBox.querySelector('.item').textContent.trim();
          const produitCarte = Array.from(container.querySelectorAll('.card')).find(card => 
            card.querySelector('.product_name').textContent.trim() === nomProduit
          );
             
          if (produitCarte) {
            const qtyValueElement = produitCarte.querySelector('#qtyValue');
            if (qtyValueElement) {
              qtyValueElement.textContent = "0";
            }
            produitCarte.querySelector('.addToCart').parentElement.classList.remove('addingItems');
          }
    
          
          produitBox.remove();
          mettreAjourPanier();
          mettreAjourPrixTotal();
        }
      }
    });
    

    if (quantite === 0) {
      produitExistant.remove();
      mettreAjourPanier();
      mettreAjourPrixTotal();
    }
  }
  mettreAjourPanier();
  mettreAjourPrixTotal();
};

const mettreAjourQuantite = (qtyElement, action) => {
  let quantity = parseInt(qtyElement.textContent, 10) || 0;

  if (action === 'increment') {
    quantity++;
  } else if (action === 'decrement') {
    quantity = Math.max(0, quantity - 1);
  }

  qtyElement.textContent = quantity;
  return quantity;
};

const mettreAjourPanier = () => {
  const totalProduit = Array.from(addedItemsBox.querySelectorAll('.itemBox')).reduce((somme, article) => {
    const itemInfo = article.querySelector('.itemInfo').textContent;
    const quantite = parseInt(itemInfo.split('x')[0], 10) || 0;
    return somme + quantite;
  }, 0);

  totalProduit > 0 ? toggleAddedItemsBox.classList.add('newState') : toggleAddedItemsBox.classList.remove('newState');
  countAddedItems.textContent = `Your Cart (${totalProduit})`;
};

const mettreAjourPrixTotal = () => {
  const prixTotal = Array.from(addedItemsBox.querySelectorAll('.itemBox')).reduce((somme, article) => {
    const infoArticle = article.querySelector('.itemInfo').textContent;
    const priceMatch = infoArticle.match(/\$([0-9]+(\.[0-9]{1,2})?)/);
    const prixArticle = priceMatch ? parseFloat(priceMatch[1]) : 0;
    return somme + prixArticle;
  }, 0);

  if (prixTotal > 0) {
    orderTotal.classList.add('addedArticle');
    orderTotal.innerHTML = `<p>Order Total</p> <strong class="ttOrder">$${prixTotal.toFixed(2)}</strong>`;
  } else {
    orderTotal.classList.remove('addedArticle');
    orderTotal.innerHTML = `<p>Your added items will appear here</p>`;
  }
};

//#endregion

//#region Confirmer la commande

BtnConfirmOrder.addEventListener('click', confirmerCommande);

function confirmerCommande() {
  showModal();
  const items = document.querySelectorAll('.itemBox');
  if (items.length === 0) {
    alert("Votre panier est vide !");
    return;
  }

  const orderContent = document.querySelector('.order-content');
  let totalCommande = 0;
  let produitsCommande = [];

  fetch('./assets/data.json')

  .then(response => {
    if(response.ok){
      return response.json();
    }

    throw new Error('Une erreur s est produite ');
  })

  .then(data => {
    data.forEach(product =>{
      let prName = product.name;
      
      let prImage = product.image.desktop;
      productsData.push({prName, prImage});
    })
    
  })

  .catch(error => {
    console.error('Une erreur s est produite !' + error);
  })

  items.forEach(item => {
    const nomProduit = item.querySelector('.item').textContent;
    const quantite = parseInt(item.querySelector('.qty').textContent);
    const prixUnitaire = item.querySelector('.dessertPrice').textContent.replace('$', '');
    const prixTotal = parseFloat(item.querySelector('.qtyPrice').textContent.replace('$', ''));
    let ImgSrc = '';
    const produitCarte = Array.from(container.querySelectorAll('.card')).find(card => 
      card.querySelector('.img').alt.trim() === nomProduit
    );

    if(produitCarte){
      const images = produitCarte.querySelectorAll('.card .product .img');
      images.forEach(i => {
        ImgSrc = i.src;
      })    
    }
    

    totalCommande += prixTotal;
    produitsCommande.push({ nomProduit, ImgSrc, quantite, prixUnitaire, prixTotal });

    
    
  });

  const prixTotal = Array.from(addedItemsBox.querySelectorAll('.itemBox')).reduce((somme, article) => {
    const infoArticle = article.querySelector('.itemInfo').textContent;
    const priceMatch = infoArticle.match(/\$([0-9]+(\.[0-9]{1,2})?)/);
    const prixArticle = priceMatch ? parseFloat(priceMatch[1]) : 0;
    return somme + prixArticle;
  }, 0);

  let orderTotalElement = document.querySelector('.ttOderCart');
  orderTotalElement.innerHTML = `<p>Order Total</p> <strong class="ttOrder">$${prixTotal.toFixed(2)}</strong>`;


  produitsCommande.forEach(pdCmd => {

    const html = `
      <div class="flex  items-center justify-between border-b py-3">       
        <div class="flex items-center gap-4">
          <img src="${pdCmd.ImgSrc}" alt="${pdCmd.nomProduit}" class="w-12 h-12 prd-img rounded-lg">
          <div>
            <h3 class="font-medium">${pdCmd.nomProduit}</h3>
            <p class="text-sm text-gray-500">
              <span class="text-orange-500">${pdCmd.quantite}x</span>@${pdCmd.prixUnitaire.replace('@','$')}
            </p>
          </div>
        </div>
        
        <span class="font-bold">$${pdCmd.prixTotal.toFixed(2)}</span>
      </div>
    `;

    orderContent.insertAdjacentHTML('beforeend', html);
  })

}

function showModal() {
  document.getElementById('orderConfirmationModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('orderConfirmationModal').classList.add('hidden');
}



btnStartNewOrder.addEventListener('click', startNewOrder);

function startNewOrder(){
  location.reload();
}



//#endregion