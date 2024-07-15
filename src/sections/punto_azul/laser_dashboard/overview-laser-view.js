'use client';
import { useState, useEffect, useCallback } from 'react';

import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { useAuthContext } from 'src/auth/hooks';
import { useMockedUser } from 'src/hooks/use-mocked-user';
import AppWidgetSummary from '../app/app-widget-summary';
import Card from '@mui/material/Card';
import {
  _ecommerceNewProducts,
  _ecommerceBestSalesman,
  _ecommerceSalesOverview,
  _ecommerceLatestProducts,
} from 'src/_mock';
import Walktour, { useWalktour } from 'src/sections/punto_azul/walktour';
import { useSettingsContext } from 'src/components/settings';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import EcommerceYearlySales from '../../overview/e-commerce/ecommerce-yearly-sales';
import EcommerceSaleByGender from '../../overview/e-commerce/ecommerce-sale-by-gender';
import EcommerceSalesOverview from '../../overview/e-commerce/ecommerce-sales-overview';
import EcommerceCurrentBalance from '../../overview/e-commerce/ecommerce-current-balance';
import Footer from '../user/footer/footer';
import { getDataLaser,  getAverageLaserValue} from '../../../utils/axios';
// ----------------------------------------------------------------------

export default function OverviewLaserView() {
  // const { user } = useMockedUser();
  const [tableData, setTableData] = useState([]);
  const [averageValue, setAverageValue] = useState([]);
  const { user } = useAuthContext();
  const theme = useTheme();

  const settings = useSettingsContext();

  const calculateAverageValues = (originalArray) => {
    // Find the object with the 'velocity_month' key
    const velocityMonthObject = originalArray.find(obj => obj.key === 'velocity_month');
  
    // If the 'velocity_month' object exists
    if (velocityMonthObject) {
      // Get the values from the 'details' property
      const velocityMonthDetails = Object.values(velocityMonthObject.details || {});
  
      // Combine the unique keys from the 'velocity_month' details
      const combinedKeys = [...new Set(velocityMonthDetails.flatMap(Object.keys))];
  
      // Create a new object to store the average values
      const averageValues = {};
  
      // Iterate over the combined keys
      combinedKeys.forEach(key => {
        // Get the values for the current key from the 'velocity_month' details
        const values = velocityMonthDetails.map(obj => obj[key] || 0);
  
        // Calculate the sum of values
        const sum = values.reduce((acc, val) => acc + val, 0);
  
        // Calculate the average
        const average = sum / values.filter(val => val !== 0).length;
  
        // Round the average value to two decimal places
        const roundedAverage = Math.round(average * 100) / 100;
  
        // Store the rounded average value in the new object
        averageValues[key] = roundedAverage;
      });
  
      return averageValues;
    } else {
      // If the 'velocity_month' object doesn't exist, return an empty object
      return {};
    }
  };

  const calculateAverageLastSixMonths = (originalArray) => {
    // Find the object with the 'average_time_aws' key
    const averageTimeAwsObject = originalArray.find(obj => obj.key === 'average_time_aws');
  
    // If the 'average_time_aws' object exists
    if (averageTimeAwsObject) {
      // Get the values from the 'details' property
      const averageTimeAwsDetails = Object.values(averageTimeAwsObject.details || {});
  
      // Sort the keys in descending order
      const sortedKeys = Object.keys(averageTimeAwsDetails).sort((a, b) => b - a);
  
      // Get the last six months' keys
      const lastSixMonthsKeys = sortedKeys.slice(0, 6);
  
      // Get the values for the last six months
      const lastSixMonthsValues = lastSixMonthsKeys.map(key => averageTimeAwsDetails[key] || 0);
  
      // Calculate the sum of values
      const sum = lastSixMonthsValues.reduce((acc, val) => acc + val, 0);
  
      // Calculate the average
      const average = sum / lastSixMonthsValues.filter(val => val !== 0).length;
  
      // Round the average value to two decimal places
      const roundedAverage = Math.round(average * 100) / 100;
  
      return roundedAverage;
    } else {
      // If the 'average_time_aws' object doesn't exist, return 0
      return 0;
    }
  };
  
  // Function to group objects by pv and add total_time
const groupByPvAndAddTotalTime = (data, velocityMapping) => {
  return data.reduce((acc, obj) => {
    const pv = obj.pv;
    if (!acc[pv]) {
      acc[pv] = [];
    }

    // Calculate the velocity_average
    const velocity_average = velocityMapping[obj.espesor] || 0;

    // Add total_time property to the object
    const newObj = {
      ...obj,
      total_time: Math.round(obj.metros * velocity_average * 100) / 100  
    };

    acc[pv].push(newObj);
    return acc;
  }, {});
};

const calculateTimes = (groupedByPv) => {
  const result = [];

  for (const pv in groupedByPv) {
    const pvData = groupedByPv[pv];
    let totalTime = 0;
    const closedTime = [];
    const activeTime = [];

    pvData.forEach(obj => {
      totalTime += obj.total_time;

      if (obj.status === 'closed') {
        closedTime.push(obj.total_time);
      } else if (obj.status === 'active') {
        activeTime.push(obj.total_time);
      }
    });

    result.push({
      pv,
      totalTime,
      closedTime,
      activeTime
    });
  }

  return result;
};

const getTotalTimeByPv = (timesByPv) => {
  const totalTimeByPv = [];

  // First, calculate the total value
  const totalValue = timesByPv.reduce((sum, pvData) => sum + pvData.totalTime, 0);

  timesByPv.forEach((pvData) => {
    const { pv: label, totalTime } = pvData;

      // Calculate the percentage
      const value = Math.round(((totalTime / totalValue) * 100 + Number.EPSILON) * 100) / 100;

      const existingPvData = totalTimeByPv.find((item) => item.label === label);

      if (existingPvData) {
          // existingPvData.value += value;
          existingPvData.value += Math.round(((existingPvData.value / totalValue)  * 100 + Number.EPSILON) * 100) / 100;
      } else {
          totalTimeByPv.push({ label, value });
      }
  });

  return { totalTimeByPv, totalValue };
};



const calculateTotalActiveTime = (data) => {
  let total_time = 0;
  
  // Iterate over each key-value pair in the object
  Object.values(data).forEach(arr => {
    arr.forEach(item => {
      if (item.status === "active") {
        total_time += item.total_time;
      }
    })
  });

  return total_time;
};

const getFutureDates = (numOfDays) => {
  // get current date
  let futureDate = new Date();
  let futureDatesList = [];

  while (numOfDays > 0) {
    futureDate.setDate(futureDate.getDate() + 1);
    // If it's not a weekend, decrement numOfDays and add the date to the list
    if (futureDate.getDay() !== 0 && futureDate.getDay() !== 6) {
      // extract day and month, adding 1 to month as JavaScript's getMonth starts from 0 for January
      let day = futureDate.getDate();
      let month = futureDate.getMonth() + 1;
  
      futureDatesList.push(`${day}/${month}`);
      numOfDays--;
    }
  }

  return futureDatesList;
};

const getValuesArray = (array, startValue) => {
  // Initialize the array with the starting value
  let valuesArray = [Math.floor(startValue)];
  let currentSum = startValue;

  // This stops the loop 1 index before the end because it's difficult to 
  // handle the condition accurately on the last index
  for (let i = 1; i < array.length - 1; i++) {
    // Maximum value for the random number would be (array.length * startValue - currentSum) / (array.length - i)
    let maxValue = (array.length * startValue - currentSum) / (array.length - i);
    let randomValue = Math.floor(Math.random() * maxValue);

    currentSum += randomValue;
    valuesArray.push(randomValue);
  }

  // Add final value to make the sum exactly array.length * startValue
  let finalValue = Math.floor(array.length * startValue - currentSum);
  valuesArray.push(finalValue);

  return valuesArray;
};



  
  

  useEffect(() => {
    async function fetchData() {
      const new_tableData = await getDataLaser(user.accessToken);
      const new_average_value = await getAverageLaserValue(user.accessToken);
      setTableData(...tableData, new_tableData);
      setAverageValue(...averageValue, new_average_value);
    }

    fetchData();
  }, []);
  console.log(tableData, 'Inside dashboard');
  const velocity_average = calculateAverageValues(averageValue);
  const time_average = calculateAverageLastSixMonths(averageValue)
  console.log(velocity_average , 'avelocity_average');
  console.log(time_average , 'time_average');
  // Call the groupByPvAndAddTotalTime function
const groupedByPv = groupByPvAndAddTotalTime(tableData, velocity_average);

console.log('Grouped by pv:', groupedByPv);

const timesByPv = calculateTimes(groupedByPv);

console.log('Times by pv:', timesByPv);

const {totalTimeByPv, totalValue} = getTotalTimeByPv(timesByPv);
console.log('totalTimeByPv:',  totalTimeByPv);
console.log('totalValue:', totalValue);
// Round to one decimal place
let totalActiveTime = calculateTotalActiveTime(groupedByPv);
const days = Math.round((totalActiveTime  / time_average + Number.EPSILON) * 10) / 10; // Assume you have defined and calculated totalValue & time_average
console.log('days:', days);

const days_array = getFutureDates(days)

let values_array = getValuesArray(days_array, time_average);

console.log(`Values array:\n${values_array.join("\n")}`);
console.log(`Total active time is: ${totalActiveTime.toFixed(1)}`);
 // replace with desired number
console.log(`The day/month from today until ${days} weekdays will be: ${getFutureDates(days)}`);

// let totalValue = totalTimeByPv.reduce((accumulator, currentItem) => {
//   return accumulator + currentItem.value;
// }, 0);



  const walktour = useWalktour({
    defaultRun: true,
    showProgress: true,
    steps: [
      {
        target: '#demo__1',
        title: 'Ejemplo 1',
        disableBeacon: true,
        content: (
          <Typography sx={{ color: 'text.secondary' }}>
            Resumen del tiempo por PV que falta por procesar.
          </Typography>
        ),
      },
      {
        target: '#demo__2',
        title: 'Ejemplo  2',
        content: (
          <Stack spacing={3}>
            <Typography sx={{ color: 'text.secondary' }}>
              Total del tiempo y comparacion entres todos los pv disponibles.
            </Typography>
          </Stack>
        ),
      },
      {
        target: '#demo__3',
        title: 'Ejemplo 3',
        placement: 'bottom',
        content: (
          <Stack spacing={3}>
            <Typography sx={{ color: 'text.secondary' }}>
              Tiempo necesario para terminar la carga de trabajo actual.
            </Typography>

          </Stack>
        ),
      },
      {
        target: '#demo__4',
        title: 'Ejemplo 4',
        placement: 'left',
        content: (
          <Stack spacing={3}>
            <Typography sx={{ color: 'text.secondary' }}>
              Programas cortados en dia anterior.
            </Typography>

  
      
          </Stack>
        ),
      },
      {
        target: '#demo__5',
        title: 'Ejemplo 5',
        placement: 'left',
        showProgress: false,
        styles: {
          options: {
            arrowColor: theme.palette.grey[900],
          },
          tooltip: {
            width: 480,
            backgroundColor: theme.palette.grey[900],
          },
          tooltipTitle: {
            color: theme.palette.common.white,
          },
          buttonBack: {
            color: theme.palette.common.white,
          },
          buttonNext: {
            marginLeft: theme.spacing(1.25),
            color: theme.palette.primary.contrastText,
            backgroundColor: theme.palette.primary.main,
          },
        },
        content: (
          <Stack spacing={3}>
            <Typography sx={{ color: 'text.disabled' }}>
              Tiempo promedio diario.
            </Typography>
          </Stack>
        ),
      },
    ],
  });




  return (
    <>
    <Walktour
    continuous
    showProgress
    showSkipButton
    disableOverlayClose
    steps={walktour.steps}
    run={walktour.run}
    callback={walktour.onCallback}
    getHelpers={walktour.setHelpers}
    scrollDuration={500}
  />
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>


      <Container id="demo__1"  maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>

          
      {timesByPv.map((pvData, index) => {
        const colors = [
          theme.palette.info.light,
          theme.palette.info.main,
          theme.palette.warning.light,
          theme.palette.warning.main,
          theme.palette.success.light,
          theme.palette.success.main,
          theme.palette.error.light,
          theme.palette.error.main,
        ];

        const closedTimeSum = pvData.closedTime.reduce((a, b) => a + b, 0);
        const activeTimeSum = pvData.activeTime.reduce((a, b) => a + b, 0);
        const percent = activeTimeSum > 0 ? closedTimeSum / activeTimeSum : 0;

        return (
          <Grid key={index} item xs={12} md={4}>
            <AppWidgetSummary
              title={`PV ${pvData.pv}`}
              percent={percent}
              total={pvData.totalTime}
              chart={{
                colors: colors.slice(index * 2, index * 2 + 2),
                series: [0, ...pvData.activeTime],
              }}
            />
          </Grid>
        );
      })}
        </Grid>
 
      </ Container>




        <Grid xs={12} md={6} lg={4}>
          <EcommerceSaleByGender
          id="demo__2"
            title="Total (min) by Pv"
            total={totalValue}
            chart={{
              series: totalTimeByPv
              ,
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <EcommerceYearlySales
          id="demo__3"
            title="Tiempo"
            subheader="Para completar la carga de trabajo"
            chart={{
              categories: days_array,
              series: [
                {
                  year: '2024',
                  data: [
                    {
                      name: 'Tiempo',
                      data: values_array,
                    },
                    // {
                    //   name: 'dias',
                    //   data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                    // },
                    // {
                    //   name: 'Total Expenses',
                    //   data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 13, 56, 77],
                    // },
                  ],
                },
                {
                  year: '2025',
                  data: [
                    {
                      name: 'Total Income',
                      data: [51, 35, 41, 10, 91, 69, 62, 148, 91, 69, 62, 49],
                    },
                    {
                      name: 'Total Expenses',
                      data: [56, 13, 34, 10, 77, 99, 88, 45, 77, 99, 88, 77],
                    },
                  ],
                },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <EcommerceSalesOverview id="demo__4" title="Sales Overview" data={_ecommerceSalesOverview} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <EcommerceCurrentBalance
          id="demo__5"
            title="Current Balance"
            currentBalance={187650}
            sentAmount={25500}
          />
        </Grid>
      </Grid>
    </Container>
    <Footer />
    </>
  );
}
