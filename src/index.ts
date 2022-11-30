export type ServiceYear = 2020 | 2021 | 2022;
export type ServiceType = "Photography" | "VideoRecording" | "BlurayPackage" | "TwoDayEvent" | "WeddingSession";
export type PriceParameter = {
    year: ServiceYear;
    type: ServiceType;
    price: number;
  };
export type PackagePriceParameter = {
    year: ServiceYear;
    types: ServiceType[];
    price: number;
};
export type DiscountParameter = {
    year: ServiceYear;
    types: ServiceType[];
    discount: number;
};
export type RequiredService = {
    type: ServiceType;
    requiredTypes: ServiceType[];
};

export const priceParameters : PriceParameter[] = [
    {year: 2022, type: "Photography", price: 1900},
    {year: 2022, type: "VideoRecording", price: 1900},
    {year: 2022, type: "BlurayPackage", price: 300},
    {year: 2022, type: "TwoDayEvent", price: 400},
    {year: 2022, type: "WeddingSession", price: 600},

    {year: 2021, type: "Photography", price: 1800},
    {year: 2021, type: "VideoRecording", price: 1800},
    {year: 2021, type: "BlurayPackage", price: 300},
    {year: 2021, type: "TwoDayEvent", price: 400},
    {year: 2021, type: "WeddingSession", price: 600},

    {year: 2020, type: "Photography", price: 1700},
    {year: 2020, type: "VideoRecording", price: 1700},
    {year: 2020, type: "BlurayPackage", price: 300},
    {year: 2020, type: "TwoDayEvent", price: 400},
    {year: 2020, type: "WeddingSession", price: 600}
];

export const PackagePriceParameters : PackagePriceParameter[] = [
    {year: 2022, types: ["Photography", "VideoRecording"], price: 2500},
    {year: 2021, types: ["Photography", "VideoRecording"], price: 2300},
    {year: 2020, types: ["Photography", "VideoRecording"], price: 2200},
];

export const discountParameters : DiscountParameter[] = [
    {year: 2022, types: ["Photography", "WeddingSession"], discount: 600},
    {year: 2022, types: ["VideoRecording", "WeddingSession"], discount: 300},

    {year: 2021, types: ["Photography", "WeddingSession"], discount: 300},
    {year: 2021, types: ["VideoRecording", "WeddingSession"], discount: 300},

    {year: 2020, types: ["Photography", "WeddingSession"], discount: 300},
    {year: 2020, types: ["VideoRecording", "WeddingSession"], discount: 300}
];

export const requiredServices : RequiredService[] = [
    { type: "BlurayPackage", requiredTypes: ["VideoRecording"]},
    { type: "TwoDayEvent", requiredTypes: ["VideoRecording", "Photography"]}
];

export const priceParameterSum = (selectedServices: ServiceType[], selectedYear: ServiceYear) : number => {
    return priceParameters.reduce(function(sum, item){ 
        return (item.year === selectedYear && selectedServices.includes(item.type) && (sum + item.price)) || sum; }, 0)
};

export const maximumDiscount = (selectedServices: ServiceType[], selectedYear: ServiceYear) : number  => {
    const filteredDiscountParameters = discountParameters.filter(item => item.year === selectedYear && isSubset(selectedServices, item.types));

    return filteredDiscountParameters.length === 0 ? 0 
        : filteredDiscountParameters.reduce(function(prev, current) {
        return (prev.discount > current.discount) ? prev : current}).discount;
};

export const packageDiscount = (selectedServices: ServiceType[], selectedYear: ServiceYear) : number  => {
    const filteredPackageDiscountParameters = PackagePriceParameters.filter(item => item.year === selectedYear && isSubset(selectedServices, item.types));

    return filteredPackageDiscountParameters.length === 0 ? 0 
        : priceParameterSum(["Photography", "VideoRecording"], selectedYear) 
            - filteredPackageDiscountParameters[0].price;
};

export const isRequiredAnyService = (previouslySelectedServices: ServiceType[], selectedService: ServiceType) : boolean  => {
    const filteredRequiredServices = requiredServices.filter(item => item.type === selectedService);
    
    return filteredRequiredServices.length === 0 ? true 
        : filteredRequiredServices.some(item => item.requiredTypes.some( arr => previouslySelectedServices.includes(arr)));
};

export const updateSelectedServices = (
    previouslySelectedServices: ServiceType[],
    action: { type: "Select" | "Deselect"; service: ServiceType }
) => {
    switch(action.type) { 
        case "Select": { 
            if (!previouslySelectedServices.includes(action.service) 
                && isRequiredAnyService(previouslySelectedServices, action.service)){
                previouslySelectedServices.push(action.service);
            }
            break;
        } 
        case "Deselect": { 
            if (previouslySelectedServices.includes(action.service)){
                const index = previouslySelectedServices.findIndex(type => type === action.service);
                previouslySelectedServices.splice(index, 1);
                
                var notRequiredServices = previouslySelectedServices.filter(item => !isRequiredAnyService(previouslySelectedServices, item))
                if (notRequiredServices.length > 0){
                    updateSelectedServices(previouslySelectedServices, {
                        type: "Deselect",
                        service: notRequiredServices[0]
                    });
                }
            }
            break; 
        }
    }  
    return previouslySelectedServices;
};

export const calculatePrice = (selectedServices: ServiceType[], selectedYear: ServiceYear) => {
    const price = priceParameterSum(selectedServices, selectedYear);
    return { 
        
        basePrice: price,
        finalPrice: price
            - packageDiscount(selectedServices, selectedYear) 
            - maximumDiscount(selectedServices, selectedYear)
    }
};

export const isSubset = (arr1, arr2) =>
  arr2.every((item) => arr1.includes(item));