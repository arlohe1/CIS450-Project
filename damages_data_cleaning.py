#!/usr/bin/env python
# coding: utf-8

# In[1]:


import pandas as pd
import numpy as np
from datetime import datetime


# In[2]:


damages = pd.read_csv('StormEvents.csv')
damages.head()


# In[3]:


# change col names to lowercase and only keep relevant columns
damages.columns = [i.lower() for i in damages.columns]

damages = damages.loc[:,['event_id', 'episode_id', 'event_type', 'episode_narrative', 'event_narrative', 'begin_date_time', 
 'end_date_time', 'damage_property','damage_crops', 'state', 'cz_name', 'injuries_direct', 
 'injuries_indirect', 'deaths_direct', 'deaths_indirect', 'source']]

damages.head(2)


# In[4]:


usa_states = """Alabama
Alaska
Arizona
Arkansas
California
Colorado
Connecticut
Delaware
Florida
Georgia
Hawaii
Idaho
Illinois
Indiana
Iowa
Kansas
Kentucky
Louisiana
Maine
Maryland
Massachusetts
Michigan
Minnesota
Mississippi
Missouri
Montana
Nebraska
Nevada
New Hampshire
New Jersey
New Mexico
New York
North Carolina
North Dakota
Ohio
Oklahoma
Oregon
Pennsylvania
Rhode Island
South Carolina
South Dakota
Tennessee
Texas
Utah
Vermont
Virginia
Washington
West Virginia
Wisconsin
Wyoming
District of Columbia""".split('\n')

usa_states = [i.lower() for i in usa_states]
print(len(usa_states))


# In[5]:


# convert to lowercase
damages['state'] = damages['state'].str.lower()
damages['cz_name'] = damages['cz_name'].str.lower()
damages['event_type'] = damages['event_type'].str.lower()
damages['source'] = damages['source'].str.lower()


# In[6]:


# remove any non-states
damages = damages[damages['state'].isin(usa_states)]


# In[7]:


# remove k from both damage_property and damage_crops

def format_amt(amt):
    string = str(amt)
    if string == 'nan':
        return 0
    elif 'K' in string:
        return float(string.replace('K', '')) * 1000
    elif 'M' in string:
        return float(string.replace('M', '')) * 1000000
    else:
        return float(string)
    
damages['damage_property'] = damages['damage_property'].apply(format_amt)
damages['damage_crops'] = damages['damage_crops'].apply(format_amt)


# In[8]:


# remove time
damages['begin_date'] = damages['begin_date_time'].apply(lambda x: datetime.strptime(x, '%d-%b-%y %H:%M:%S').date())
damages['end_date'] = damages['end_date_time'].apply(lambda x: datetime.strptime(x, '%d-%b-%y %H:%M:%S').date())
damages = damages.drop(['begin_date_time', 'end_date_time'], axis=1)


# In[9]:


damages.head()


# In[10]:


for col in list(damages.columns):
    print('max {} length: {}'.format(col, max(damages[col].apply(str).apply(len))))


# In[11]:


damages.to_csv('cleaned_damages.csv')


# In[ ]:




