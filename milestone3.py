#%%
import pandas as pd
import numpy as np

#%%
census_df = pd.read_csv('census.csv')

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
census_df.to_csv("census_clean.csv", index=False)

#%%
measurer = np.vectorize(len)
res1 = measurer(census_df.values.astype(str)).max(axis=0)