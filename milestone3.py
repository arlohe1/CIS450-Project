#%%
import pandas as pd
import numpy as np
import re

#%%
census_df = pd.read_csv('acs2017_county_data.csv')

#%%
def remove_county(name):
    arr = name.split(' County')
    county = arr[0].lower()
    return county

#%%
census_df['County'] = census_df['County'].apply(lambda x: remove_county(x))

#%%
print(len(census_df))

#%%
# drop nans
census_df.dropna(inplace=True)
print(len(census_df))

#%%
# remove whitespace and lowercase state and county
census_df['formattedState'] = census_df['State'].apply(lambda x: re.sub("[^a-zA-Z]+", "", x.lower()))
census_df['formattedCounty'] = census_df['County'].apply(lambda x: re.sub("[^a-zA-Z]+", "", x.lower()))

#%%
census_df.to_csv("census_clean.csv", index=False)

#%%
measurer = np.vectorize(len)
res1 = measurer(census_df.values.astype(str)).max(axis=0)