import { createSlice } from "@reduxjs/toolkit";

function loadLocalData()
{
    const data = localStorage.getItem("data");
    
    if(data!=null && data!=undefined){
        const dataObj =  JSON.parse(data);
        //console.log(dataObj);
        return dataObj;
    }else{
        return {
            students : [],
            teachers : [],
            classes : [],
            nonTeachingStaff : [],
            load_done : false
        }
    }
}

const slice = createSlice({
    name : 'slms',
    initialState : {
        value : loadLocalData()
    },
    reducers:{
        setData : (store,action)=>{
            store.value = {...action.payload,load_done:true};
        },
        delData : (store)=>{
            store.value = {
                students : [],
                teachers : [],
                classes : [],
                nonTeachingStaff : [],
                load_done : false
            }
        }
    }
});

export const {setData,delData} = slice.actions;
export default slice.reducer;