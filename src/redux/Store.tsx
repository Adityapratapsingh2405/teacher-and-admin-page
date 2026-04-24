import { configureStore } from "@reduxjs/toolkit";
import DataReducer from './DataSlice';

const store = configureStore({
    reducer : {
        data : DataReducer
    }
});

store.subscribe(()=>
{
    const data = JSON.stringify(store.getState().data.value);
    localStorage.setItem("data",data);
})


export default store;