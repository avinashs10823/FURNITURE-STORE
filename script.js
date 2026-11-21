
let products = JSON.parse(localStorage.getItem("products")) || [
{id:1,name:"Sofa",price:25000,category:"Sofa",image:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500"},
{id:2,name:"Chair",price:4500,category:"Chair",image:"https://images.unsplash.com/photo-1503602642458-232111445657?w=500"},
{id:3,name:"Bed",price:35000,category:"Bed",image:"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500"},
{id:4,name:"Table",price:18000,category:"Table",image:"https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500"}
];
let cart=JSON.parse(localStorage.getItem("cart"))||[];
let users=JSON.parse(localStorage.getItem("users"))||[];
let orders=JSON.parse(localStorage.getItem("orders"))||[];
let user=JSON.parse(localStorage.getItem("user"))||null;
let register=false,admin=false;

function save(){
localStorage.setItem("products",JSON.stringify(products));
localStorage.setItem("cart",JSON.stringify(cart));
localStorage.setItem("users",JSON.stringify(users));
localStorage.setItem("orders",JSON.stringify(orders));
localStorage.setItem("user",JSON.stringify(user));
}

function displayProducts(){
let list=document.getElementById("product-list");
let s=document.getElementById("search").value.toLowerCase();
let c=document.getElementById("category").value;
let sort=document.getElementById("sort").value;
list.innerHTML="";
let data=[];
for(let p of products){
if(p.name.toLowerCase().includes(s)&&(c==="All"||p.category===c))data.push(p);
}
if(sort==="low")data.sort((a,b)=>a.price-b.price);
if(sort==="high")data.sort((a,b)=>b.price-a.price);
for(let p of data){
list.innerHTML+=`<div class="product-card"><img src="${p.image}"><h3>${p.name}</h3><p>₹${p.price}</p><button onclick="addCart(${p.id})">Add Cart</button><button onclick="details(${p.id})">Details</button></div>`;
}
if(data.length===0)list.innerHTML="No Products Found";
}

function details(id){
let p=products.find(x=>x.id===id);
document.getElementById("product-details").innerHTML=`<img src="${p.image}"><h2>${p.name}</h2><h3>₹${p.price}</h3>`;
openModal("product-modal");
}

function addCart(id){
let found=false;
for(let p of cart){if(p.id===id){p.quantity++;found=true;}}
if(!found)cart.push({id:id,quantity:1});
save();updateCart();alert("Added to Cart");
}

function updateCart(){
let count=0;
for(let p of cart)count+=p.quantity;
document.getElementById("cart-count").innerText=count;
}

function showCart(){
let box=document.getElementById("cart-items"),total=0;
box.innerHTML="";
for(let item of cart){
let p=products.find(x=>x.id===item.id);
if(!p)continue;
total+=p.price*item.quantity;
box.innerHTML+=`<p>${p.name} x ${item.quantity} <button onclick="removeCart(${p.id})">Delete</button></p>`;
}
document.getElementById("cart-total").innerText="Total: ₹"+total;
openModal("cart-modal");
}

function removeCart(id){
cart=cart.filter(p=>p.id!==id);
save();updateCart();showCart();
}

function openModal(id){document.getElementById(id).style.display="flex";}
function closeModal(id){document.getElementById(id).style.display="none";}
function showLogin(){openModal("login-modal");}
function showAdmin(){openModal("admin-modal");}

function toggleAuth(){
register=!register;
document.getElementById("auth-heading").innerText=register?"Register":"Login";
document.getElementById("auth-name").hidden=!register;
document.getElementById("auth-name").required=register;
document.getElementById("auth-submit").innerText=register?"Register":"Login";
}

document.getElementById("auth-form").onsubmit=function(e){
e.preventDefault();
let name=document.getElementById("auth-name").value.trim();
let email=document.getElementById("auth-email").value.toLowerCase();
let password=document.getElementById("auth-password").value;
if(register){
if(!/^[A-Za-z ]+$/.test(name))return alert("Only alphabets allowed!");
for(let u of users)if(u.email===email)return alert("Email exists!");
users.push({name,email,password});
alert("Registered Successfully");
toggleAuth();
}else{
user=users.find(x=>x.email===email&&x.password===password);
if(!user)return alert("Wrong Login!");
closeModal("login-modal");
alert("Welcome "+user.name);
}
save();this.reset();
};

function checkout(){
if(cart.length===0)return alert("Cart Empty!");
if(!user){showLogin();return alert("Please Login First");}
closeModal("cart-modal");openModal("checkout-modal");
}

document.getElementById("checkout-form").onsubmit=function(e){
e.preventDefault();
let total=0;
for(let item of cart){
let p=products.find(x=>x.id===item.id);
if(p)total+=p.price*item.quantity;
}
orders.push({customer:user.name,address:document.getElementById("customer-address").value,total:total,status:"Pending"});
cart=[];save();updateCart();closeModal("checkout-modal");this.reset();alert("Order Placed");
};

document.getElementById("admin-form").onsubmit=function(e){
e.preventDefault();
if(document.getElementById("admin-user").value==="admin"&&document.getElementById("admin-pass").value==="1234"){
admin=true;
document.getElementById("admin-login").hidden=true;
document.getElementById("admin-panel").hidden=false;
loadAdmin();
}else alert("Wrong Admin Details");
};

function loadAdmin(){
if(!admin)return;
document.getElementById("total-products").innerText=products.length;
document.getElementById("total-orders").innerText=orders.length;
document.getElementById("total-users").innerText=users.length;
let box=document.getElementById("admin-products");
box.innerHTML="";
for(let p of products)box.innerHTML+=`<p>${p.name} ₹${p.price} <button onclick="editProduct(${p.id})">Edit</button> <button onclick="deleteProduct(${p.id})">Delete</button></p>`;
let list=document.getElementById("admin-orders");
list.innerHTML="";
for(let o of orders)list.innerHTML+=`<p>${o.customer} ₹${o.total} - ${o.status}</p>`;
}

document.getElementById("product-form").onsubmit=function(e){
e.preventDefault();
if(!admin)return;
let id=document.getElementById("edit-id").value;
let p={id:id?Number(id):Date.now(),name:document.getElementById("p-name").value,price:Number(document.getElementById("p-price").value),category:document.getElementById("p-category").value,image:document.getElementById("p-image").value};
if(!p.name||p.price<=0||!p.category||!p.image)return alert("Enter Valid Details");
if(id){
for(let i=0;i<products.length;i++)if(products[i].id===Number(id))products[i]=p;
}else products.push(p);
save();displayProducts();loadAdmin();this.reset();
document.getElementById("edit-id").value="";
};

function editProduct(id){
let p=products.find(x=>x.id===id);
document.getElementById("edit-id").value=p.id;
document.getElementById("p-name").value=p.name;
document.getElementById("p-price").value=p.price;
document.getElementById("p-category").value=p.category;
document.getElementById("p-image").value=p.image;
}

function deleteProduct(id){
if(confirm("Delete Product?")){
products=products.filter(p=>p.id!==id);
cart=cart.filter(p=>p.id!==id);
save();displayProducts();updateCart();loadAdmin();
}
}

function adminLogout(){
admin=false;
document.getElementById("admin-login").hidden=false;
document.getElementById("admin-panel").hidden=true;
}

displayProducts();
updateCart();

