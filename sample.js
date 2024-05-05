
// fetch(" https://pokeapi.co/api/v2/pokemon/pikachu")
// .then(response=> {
//     if(!response.ok){
//         throw new Error("Couldn't fetch resource")
//     }
//     return response.json();
// })
// .then(data=>console.log(data.name))
// .catch(error=>console.error(error)); 

fetchData();
async function fetchData(){
    try {

        const pokemonName=document.getElementById("pokemonName").value
        const response= await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        if(!response.ok){
            throw new Error("couldn't fetch resource");
        }
        const data=await response.json();
        console.log(data)
        const pokemonSprite=data.sprites.front_default;
        const imgElement = document.getElementById("pokemonSprite");
        imgElement.src = pokemonSprite;
        imgElement.style.display = "block";


    } catch (error) {
        console.error(error)
    }
}